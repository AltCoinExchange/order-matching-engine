import {IJob} from "../interfaces/job";
import {Observable} from "rxjs/Observable";
import {IWallet, WalletFactory} from "../../bot/common/wallet/WalletFactory";
import {AsyncBotDb} from "../common/asyncbotdb";
import {MoscaService} from "../../bot/common/clients/Mqtt";
import {QueueMessages} from '../common/queuemessages';
import {App} from '../config/app';
const Queue = require("bee-queue");

export class InformRedeem implements IJob {
  public queue;
  private botQueue;
  private mqtt: MoscaService;

  constructor() {
    this.queue = new Queue("bot-inform-redeem", );
    this.botQueue = new Queue("bot", App.queueGlobalConfig);
    this.mqtt = new MoscaService();
  }

  public GetQueues(): any[] {
    return [this.queue, this.botQueue];
  }

  public Start() {
    console.log("Starting inform redeem listening");
    this.queue.process("initiate", async (job, done) => {
      return await this.informRedeem(job.data, done);
    });
  }

  /**
   * Wallet initiate
   * @param {IWallet} wallet
   * @param data
   */
  private async informRedeem(data, done) {
    if (AsyncBotDb.isOrderActive(data)) {
      return new Promise((resolve, reject) => {
        this.mqtt.informBRedeem(data.data, data.redeemData).catch((e) => {
          // console.log("Initiate error", e);
          // if (e.toString().indexOf("Error: Returned error: replacement transaction underpriced") !== -1) {
          //   const newWallet = WalletFactory.createWalletFromString(data.from);
          // }
          reject(e);
          return Observable.empty();
          // return Observable.empty();
        }).subscribe(async (informed) => {
          const waitJob = this.botQueue.createJob(data);
          await waitJob.save();
          resolve();
        });
      });
    } else {
      return QueueMessages.BotDone(true);
    }
  }
}
