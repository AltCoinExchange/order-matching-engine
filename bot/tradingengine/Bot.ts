import {AppConfig} from "../config/app";
import {RedeemData} from "altcoinio-wallet";
import {BotConfig} from "../config/bot";
const uuidv4 = require("uuid/v4");
import "rxjs/add/operator/sampleTime";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/takeLast";
import "rxjs/add/operator/timeout";
import "rxjs/add/observable/empty";
import "rxjs/add/observable/fromPromise";
import "rxjs/add/operator/withLatestFrom";
import "rxjs/add/operator/switchMap";
import {Observable} from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import {DbHelper} from "../../src/modules/helpers/db.helper";
import {OrderMatchingClient} from '../../library/clients/OrderMatchingClient';
import {MoscaService} from '../../library/clients/Mqtt';
import {IWallet, WalletFactory} from '../../library/wallet/WalletFactory';
import {IOrder} from '../../library/interfaces/IOrder';

/**
 * Automatic trading bot
 */
export class Bot {

  private orderMatchingClient: OrderMatchingClient;
  private mqtt: MoscaService;

  private throttle: BehaviorSubject<any> = new BehaviorSubject<any>(1);

  private orders: any[] = [];
  private processingOrder: any = null;

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
    this.throttle.subscribe((val) => {
      this.orderMatchingClient.OrderSubscribe().subscribe((orders) => {
        for (const order of orders) {
          const availableOrder = this.orders.find( (e) => e.id === order.id);
          if (!availableOrder) {
            if (BotConfig.forbiddenTokensBuy.indexOf(order.from) === -1 &&
              BotConfig.forbiddenTokensSell.indexOf(order.to) === -1 &&
              this.processingOrder == null) {
              this.orders.push(order);
              this.processingOrder = order;
              this.createOrder(order);
            }
          }
        }
      });
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
    if (this.isOrderActive(data)) {
      return wallet.Initiate(data.address, data.depositAmount).catch((e) => {
        console.log("Initiate error", e);
        if (e.toString().indexOf("Error: Returned error: replacement transaction underpriced") !== -1) {
          const newWallet = WalletFactory.createWalletFromString(data.from);
          this.initiateOrder(newWallet, data);
        }
        return Observable.empty();
      }).subscribe(async (initData) => {
        if (!(initData as any).message) {
          console.log("BOT: initiated");
          //  Map order to inform initiate
          if (this.isOrderActive(data)) {
            const walletAddress = WalletFactory.createWalletFromString(data.to).getAddress(AppConfig.wif);
            (initData as any).address = walletAddress;
            this.mqtt.informInitiate(data, initData).subscribe((informed) => {
              if (this.isOrderActive(data)) {
                this.mqtt.waitForParticipate(data).timeout(300000).catch((err) => {
                  return this.retSuccess();
                }).subscribe((response) => {
                  this.redeemOrder(initData, data);
                });
              } else {
                return this.retSuccess();
              }
            });
          } else {
            return this.retSuccess();
          }
        } else {
          console.log("Initiate failed: ", initData);
        }
      });
    } else {
      return this.retSuccess();
    }
  }

  /**
   * Process next
   * @returns {Observable<any>}
   */
  private retSuccess() {
    this.processingOrder = null;
    this.throttle.next(1);
    return Observable.empty();
  }

  /**
   * return if order is active
   * @returns {Observable<boolean>}
   * @param data
   */
  private async isOrderActive(data) {
    const actOrder = {} as IOrder;
    actOrder.id = data.order_id;
    return await DbHelper.IsOrderActive(actOrder);
  }

  /**
   * Wallet redeem
   * @param {IWallet} wallet
   * @param data
   * @param link
   * @returns {Promise<void>}
   */
  private redeemOrder(data, link) {
    const wallet = WalletFactory.createWalletFromString(link.to);
    return wallet.Redeem(new RedeemData(data.secret, data.secretHash,
      data.contractHex, data.contractTxHex)).catch((ex) => {
      console.log("Redeem error", ex);
      if (ex.toString().indexOf("Error: Returned error: replacement transaction underpriced") !== -1) {
        this.redeemOrder(data, link);
      }
      return Observable.empty();
    }).subscribe((redeemData) => {
      this.mqtt.informBRedeem(link, redeemData).subscribe((redeemed) => {
        console.log("Redeemed successfully.");
        this.retSuccess();
      });
    });
  }
}
