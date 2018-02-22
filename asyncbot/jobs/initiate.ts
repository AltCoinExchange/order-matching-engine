import {IJob} from "../interfaces/job";
import {Observable} from "rxjs/Observable";
import {IWallet, WalletFactory} from "../../bot/common/wallet/WalletFactory";
import {AsyncBotDb} from "../common/asyncbotdb";
import {AppConfig} from "../../bot/config/app";
import "rxjs/add/operator/catch";
import {QueueMessages} from '../common/queuemessages';
import {App} from '../config/app';

const Queue = require("bee-queue");

export class Initiate implements IJob {
  public queue;
  private informInitiate;

  constructor() {
    this.queue = new Queue("bot-initiate", App.queueGlobalConfig);
    this.informInitiate = new Queue("bot-inform-initiate", App.queueGlobalConfig);
  }

  public GetQueues(): any[] {
    return [this.queue, this.informInitiate];
  }

  public Start() {
    console.log("Starting initiate listening");
    this.queue.process("initiate", async (job) => {
      return await this.initiateOrder(job.data);
    });
  }

  /**
   * Wallet initiate
   * @param data
   * @param done
   */
  private async initiateOrder(data) {
    if (AsyncBotDb.isOrderActive(data)) {
      return new Promise((resolve, reject) => {
        const wallet = WalletFactory.createWalletFromString(data.from);
        wallet.Initiate(data.address, data.depositAmount).catch((e) => {
          // console.log("Initiate error", e);
          // if (e.toString().indexOf("Error: Returned error: replacement transaction underpriced") !== -1) {
          //   const newWallet = WalletFactory.createWalletFromString(data.from);
          // }
          // throw e;
          reject(e);
          return Observable.empty();
          // return Observable.empty();
        }).subscribe(async (initData) => {
          const walletAddress = WalletFactory.createWalletFromString(data.to).getAddress(AppConfig.wif);
          (initData as any).address = walletAddress;
          const waitJob = this.informInitiate.createJob({data, initData});
          await waitJob.retries(10).save();
          resolve(true);
        });
      });
    } else {
      return QueueMessages.BotDone(true);
    }
  }
}
