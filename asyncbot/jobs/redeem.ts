import {IJob} from "../interfaces/job";
import {Observable} from "rxjs/Observable";
import {IWallet, WalletFactory} from "../../bot/common/wallet/WalletFactory";
import {AsyncBotDb} from "../common/asyncbotdb";
import {MoscaService} from "../../bot/common/clients/Mqtt";
import {RedeemData} from "altcoinio-wallet";
import "rxjs/add/operator/catch";
import {QueueMessages} from '../common/queuemessages';
const Queue = require("bee-queue");

export class Redeem implements IJob {
  public queue;
  private informRedeem;
  private mqtt: MoscaService;

  constructor() {
    this.queue = new Queue("bot-redeem", {removeOnSuccess: true, removeOnFailure: true});
    this.informRedeem = new Queue("bot-inform-redeem", {removeOnSuccess: true, removeOnFailure: true});
    this.mqtt = new MoscaService();
  }

  public GetQueues(): any[] {
    return [this.queue, this.informRedeem];
  }

  public Start() {
    console.log("Starting redeem listening");
    this.queue.process("initiate", async (job) => {
      return await this.redeem(job.data);
    });
  }

  /**
   * Wallet initiate
   * @param {IWallet} wallet
   * @param data
   */
  private async redeem(data) {
    if (AsyncBotDb.isOrderActive(data.data)) {
      return new Promise((resolve, reject) => {
        const wallet = WalletFactory.createWalletFromString(data.data.to);
        wallet.Redeem(new RedeemData(data.initData.secret, data.initData.secretHash,
          data.initData.contractHex, data.initData.contractTxHex)).catch((e) => {
          // console.log("Initiate error", e);
          // if (e.toString().indexOf("Error: Returned error: replacement transaction underpriced") !== -1) {
          //   const newWallet = WalletFactory.createWalletFromString(data.from);
          // }
          reject(e);
          throw e;
          // return Observable.empty();
        }).subscribe(async (response) => {
          data.redeemData = response;
          const waitJob = this.informRedeem.createJob(data);
          await waitJob.save();
          resolve();
        });
      });
    } else {
      return QueueMessages.BotDone(true);
    }
  }
}
