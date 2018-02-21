import {OrderMatchingClient} from "../common/clients/OrderMatchingClient";
import {MoscaService} from "../common/clients/Mqtt";
import {IOrder} from "../../src/modules/helpers/long-poll.service";
import {IWallet, WalletFactory} from "../common/wallet/WalletFactory";
import {AppConfig} from "../config/app";
import {RedeemData} from "altcoinio-wallet";
import {BotConfig} from "../config/bot";
const uuidv4 = require("uuid/v4");
import "rxjs/add/operator/sampleTime";
import "rxjs/add/operator/catch";
import {Observable} from "rxjs/Observable";

/**
 * Automatic trading bot
 */
export class Bot {

  private orderMatchingClient: OrderMatchingClient;
  private mqtt: MoscaService;

  private orders: any[] = [];

  constructor() {
    this.orderMatchingClient = new OrderMatchingClient();
    this.mqtt = new MoscaService();
  }

  /**
   * Start the bot
   * @returns {Promise<void>}
   */
  public async Start() {
    console.log("START");
    // Get active orders if any and process the first one
    this.orderMatchingClient.OrderSubscribe().sampleTime(30000 /*ms*/).subscribe((orders) => {
      for (const order of orders) {
        const availableOrder = this.orders.find( (e) => e.id === order.id);
        if (!availableOrder) {
          if (BotConfig.forbiddenTokensBuy.indexOf(order.from) === -1 &&
              BotConfig.forbiddenTokensSell.indexOf(order.to) === -1) {
            this.orders.push(order);
            this.createOrder(order);
          }
        }
      }
    });

    // Get matched order and initiate swap
    this.orderMatchingClient.OrderMatchSubscribe().subscribe(async (matchedOrder) => {
      // TODO: check if we sent the order
      if (matchedOrder.side === "b") {
        const wallet = WalletFactory.createWalletFromString(matchedOrder.from);
        await this.initiateOrder(wallet, matchedOrder);
      }
    });

    // Get matched order and initiate swap
    this.orderMatchingClient.FaucetSubscribe().subscribe(async (faucetOrder) => {
      // TODO: check if we have already filled that address
    });
  }

  /**
   * Create order and send it to the order engine
   * @param data
   */
  private createOrder(data) {

    const walletAddress = WalletFactory.createWalletFromString(data.to).getAddress(AppConfig.wif);
    const uniqueId = uuidv4().replace(/-/g, "");
    const order = {
      id: uniqueId,
      wsId: this.orderMatchingClient.GetId(),
      sellCurrency: data.to,
      buyCurrency: data.from,
      sellAmount: data.toAmount,
      buyAmount: data.fromAmount,
      sellerAddress: walletAddress,
      status: "new",
    } as IOrder;

    this.orderMatchingClient.SendOrder(order);
  }

  /** On Chain operations */

  /**
   * Wallet initiate
   * @param {IWallet} wallet
   * @param data
   */
  private initiateOrder(wallet: IWallet, data) {
    try {
      wallet.Initiate(data.address, data.depositAmount).subscribe((initData) => {
        if (!(initData as any).message) {
          console.log("BOT: initiated");
          //  Map order to inform initiate
          const walletAddress = WalletFactory.createWalletFromString(data.to).getAddress(AppConfig.wif);
          const walletRedeem = WalletFactory.createWalletFromString(data.to);
          initData.address = walletAddress;
          this.mqtt.informInitiate(data, initData).subscribe((informed) => {
            this.mqtt.waitForParticipate(data).subscribe((response) => {
              this.redeemOrder(walletRedeem, initData, data);
            });
          });
        } else {
          console.log("Initiate failed: ", initData);
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Wallet redeem
   * @param {IWallet} wallet
   * @param data
   * @param link
   * @returns {Promise<void>}
   */
  private redeemOrder(wallet: IWallet, data, link) {
    return wallet.Redeem(new RedeemData(data.secret, data.secretHash,
      data.contractHex, data.contractTxHex)).catch((ex) => {
        console.log("Redeem error", ex);
        return this.redeemOrder(wallet, data, link);
    }).subscribe((redeemData) => {
      this.mqtt.informBRedeem(link, redeemData).subscribe((redeemed) => {
        console.log("Redeemed successfully.");
      });
    });
  }
}
