import {Observable} from "rxjs/Observable";
import {AsyncBotDb} from "../common/asyncbotdb";
import {QueueMessages} from '../common/queuemessages';
import {App} from '../config/app';
import {IJob} from '../../library/interfaces/IJob';
import {MoscaService} from '../../library/clients/Mqtt';
import {IAtomicSwap} from '../../library/clients/interfaces/IAtomicSwap';
import {CommunicationFactory} from '../../library/clients/CommunicationFactory';
const Queue = require("bee-queue");

export class WaitForParticipate implements IJob {
  public queue;
  private redeem;
  private comm: IAtomicSwap;

  constructor() {
    this.queue = new Queue("bot-wait-for-participate", App.queueGlobalConfig);
    this.redeem = new Queue("bot-redeem", App.queueGlobalConfig);
  }

  public GetQueues(): any[] {
    return [this.queue, this.redeem];
  }

  public async Start() {
    console.log("Starting wait for participate listening");
    this.comm = await CommunicationFactory.GetCommunicationProvider(App);
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
        this.comm.waitForParticipate(data.data).catch((e) => {
          // console.log("Initiate error", e);
          // if (e.toString().indexOf("Error: Returned error: replacement transaction underpriced") !== -1) {
          //   const newWallet = WalletFactory.createWalletFromString(data.from);
          // }
          reject(e);
          return Observable.empty();
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
