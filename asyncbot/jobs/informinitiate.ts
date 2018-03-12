import {Observable} from "rxjs/Observable";
import {AsyncBotDb} from "../common/asyncbotdb";
import {QueueMessages} from '../common/queuemessages';
import {App} from '../config/app';
import {IJob} from '../../library/interfaces/IJob';
import {IAtomicSwap} from '../../library/clients/interfaces/IAtomicSwap';
import {CommunicationFactory} from '../../library/clients/CommunicationFactory';
const Queue = require("bee-queue");

export class InformInitiate implements IJob {
  public queue;
  private waitForParticipate;
  private comm: IAtomicSwap;

  constructor() {
    this.queue = new Queue("bot-inform-initiate", App.queueGlobalConfig);
    this.waitForParticipate = new Queue("bot-wait-for-participate", App.queueGlobalConfig);
  }

  public GetQueues(): any[] {
    return [this.queue, this.waitForParticipate];
  }

  public async Start() {
    console.log("Starting inform initiate listening");
    this.comm = await CommunicationFactory.GetCommunicationProvider(App);
    this.queue.process("initiate", async (job) => {
      return await this.informInitiate(job.data);
    });
  }

  /**
   * Wallet initiate
   * @param {IWallet} wallet
   * @param data
   */
  private async informInitiate(data) {
    if (AsyncBotDb.isOrderActive(data)) {
      return new Promise((resolve, reject) => {
        this.comm.informInitiate(data.data, data.initData).catch((e) => {
          // console.log("Initiate error", e);
          // if (e.toString().indexOf("Error: Returned error: replacement transaction underpriced") !== -1) {
          //   const newWallet = WalletFactory.createWalletFromString(data.from);
          // }
          reject(e);
          return Observable.empty();
          // return Observable.empty();
        }).subscribe(async (initData) => {
          const waitJob = this.waitForParticipate.createJob(data);
          await waitJob.timeout(300000).save();
          resolve();
        });
      });
    } else {
      return QueueMessages.BotDone(true);
    }
  }
}
