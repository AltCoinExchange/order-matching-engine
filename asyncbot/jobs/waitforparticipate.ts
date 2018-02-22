import {IJob} from "../interfaces/job";
import {Observable} from "rxjs/Observable";
import {IWallet, WalletFactory} from "../../bot/common/wallet/WalletFactory";
import {AsyncBotDb} from "../common/asyncbotdb";
import {MoscaService} from "../../bot/common/clients/Mqtt";
import {QueueMessages} from '../common/queuemessages';
const Queue = require("bee-queue");

export class WaitForParticipate implements IJob {
  public queue;
  private redeem;
  private mqtt: MoscaService;

  constructor() {
    this.queue = new Queue("bot-wait-for-participate", {removeOnSuccess: true, removeOnFailure: true});
    this.redeem = new Queue("bot-redeem", {removeOnSuccess: true, removeOnFailure: true});
    this.mqtt = new MoscaService();
  }

  public GetQueues(): any[] {
    return [this.queue, this.redeem];
  }

  public Start() {
    console.log("Starting wait for participate listening");
    this.queue.process("initiate", async (job) => {
      return await this.waitForParticipate(job.data);
    });
  }

  /**
   * Wallet initiate
   * @param {IWallet} wallet
   * @param data
   */
  private async waitForParticipate(data) {
    if (AsyncBotDb.isOrderActive(data.data)) {
      return new Promise((resolve, reject) => {
        this.mqtt.waitForParticipate(data.data).catch((e) => {
          // console.log("Initiate error", e);
          // if (e.toString().indexOf("Error: Returned error: replacement transaction underpriced") !== -1) {
          //   const newWallet = WalletFactory.createWalletFromString(data.from);
          // }
          reject(e);
          throw e;
          // return Observable.empty();
        }).subscribe(async (response) => {
          const waitJob = this.redeem.createJob(data);
          await waitJob.retries(10).save();
          resolve();
        });
      });
    } else {
      return QueueMessages.BotDone(true);
    }
  }
}
