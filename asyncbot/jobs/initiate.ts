import {IJob} from "../interfaces/job";
import {Observable} from "rxjs/Observable";
import {IWallet, WalletFactory} from "../../bot/common/wallet/WalletFactory";
import {AsyncBotDb} from "../common/asyncbotdb";
import {AppConfig} from "../../bot/config/app";
import "rxjs/add/operator/catch";

const Queue = require("bee-queue");

export class Initiate implements IJob {
  public queue;
  private informInitiate;

  constructor() {
    this.queue = new Queue("bot-initiate");
    this.informInitiate = new Queue("bot-inform-initiate");
  }

  public Start() {
    console.log("Starting initiate listening");
    this.queue.process("initiate", async (job) => {
      return await this.initiateOrder(job.data);
    });
  }

  /**
   * Wallet initiate
   * @param {IWallet} wallet
   * @param data
   */
  private async initiateOrder(data) {
    if (AsyncBotDb.isOrderActive(data)) {
      const wallet = WalletFactory.createWalletFromString(data.from);
      wallet.Initiate(data.address, data.depositAmount).catch((e) => {
        // console.log("Initiate error", e);
        // if (e.toString().indexOf("Error: Returned error: replacement transaction underpriced") !== -1) {
        //   const newWallet = WalletFactory.createWalletFromString(data.from);
        // }
        throw e;
        // return Observable.empty();
      }).subscribe(async (initData) => {
        const walletAddress = WalletFactory.createWalletFromString(data.to).getAddress(AppConfig.wif);
        (initData as any).address = walletAddress;
        const waitJob = this.informInitiate.createJob({data, initData});
        await waitJob.retries(10).save();
        return true;
      });
    } else {
      return true;
    }
  }
}
