import {IJob} from "../interfaces/job";
import {Observable} from "rxjs/Observable";
import {IWallet, WalletFactory} from "../../bot/common/wallet/WalletFactory";
import {AsyncBotDb} from "../common/asyncbotdb";
import {MoscaService} from "../../bot/common/clients/Mqtt";
import {RedeemData} from "altcoinio-wallet";
import "rxjs/add/operator/catch";
const Queue = require("bee-queue");

export class Redeem implements IJob {
  public queue;
  private informRedeem;
  private mqtt: MoscaService;

  constructor() {
    this.queue = new Queue("bot-redeem");
    this.informRedeem = new Queue("bot-inform-redeem");
    this.mqtt = new MoscaService();
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
      const wallet = WalletFactory.createWalletFromString(data.data.to);
      wallet.Redeem(new RedeemData(data.initData.secret, data.initData.secretHash,
        data.initData.contractHex, data.initData.contractTxHex)).catch((e) => {
        // console.log("Initiate error", e);
        // if (e.toString().indexOf("Error: Returned error: replacement transaction underpriced") !== -1) {
        //   const newWallet = WalletFactory.createWalletFromString(data.from);
        // }
        throw e;
        // return Observable.empty();
      }).subscribe(async (response) => {
        data.redeemData = response;
        const waitJob = this.informRedeem.createJob(data);
        waitJob.save().then((job) => {
          console.log(job);
        });

      });
    } else {
      return true;
    }
  }
}
