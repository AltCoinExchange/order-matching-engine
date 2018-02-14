import {OrderMatchingClient} from "../common/clients/OrderMatchingClient";
import {MoscaService} from "../common/clients/Mqtt";
import {IOrder} from "../../src/modules/helpers/long-poll.service";
import {IWallet, WalletFactory} from "../common/wallet/WalletFactory";
import {AppConfig} from "../config/app";
import {RedeemData} from "../../wallet/src/atomic-swap";
const uuidv4 = require("uuid/v4");

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
    // Get active orders if any and process the first one
    this.orderMatchingClient.OrderSubscribe().subscribe((orders) => {
      for (const order of orders) {
        const availableOrder = this.orders.find( (e) => e.id === order.id);
        if (!availableOrder) {
          this.orders.push(order);
          this.createOrder(order);
        }
      }
    });

    // Get matched order and initiate swap
    this.orderMatchingClient.OrderMatchSubscribe().subscribe(async (matchedOrder) => {
      // TODO: check if we sent the order
      if (matchedOrder.side === "b") {
        const wallet = WalletFactory.createWalletFromString(matchedOrder.from, AppConfig.wif);
        await this.initiateOrder(wallet, matchedOrder);
      }
    });
  }

  /**
   * Create order and send it to the order engine
   * @param data
   */
  private createOrder(data) {
    const uniqueId = uuidv4().replace(/-/g, "");
    const order = {
      id: uniqueId,
      wsId: this.orderMatchingClient.GetId(),
      sellCurrency: data.to,
      buyCurrency: data.from,
      sellAmount: data.toAmount,
      buyAmount: data.fromAmount,
      sellerAddress: data.address,
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
    // const result = await wallet.Initiate(data.address, data.depositAmount);
    wallet.Initiate(data.address, data.depositAmount).subscribe((initData) => {
      console.log("BOT: initiated");
      this.mqtt.informInitiate(data, initData).subscribe((informed) => {
        this.mqtt.waitForParticipate(data).subscribe((response) => {
          this.redeemOrder(wallet, initData, data);
        });
      });
    });
  }

  /**
   * Wallet redeem
   * @param {IWallet} wallet
   * @param data
   * @param link
   * @returns {Promise<void>}
   */
  private async redeemOrder(wallet: IWallet, data, link) {
    wallet.Redeem(new RedeemData(data.secret, data.secretHash,
      data.contractHex, data.contractTxHex)).subscribe((redeemData) => {
      this.mqtt.informBRedeem(link, redeemData).subscribe((redeemed) => {
        console.log("Redeemed successfully.");
      });
    });
  }
}
