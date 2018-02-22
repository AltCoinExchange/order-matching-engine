import {IJob} from "../interfaces/job";
import {Observable} from "rxjs/Observable";
import {IWallet, WalletFactory} from "../../bot/common/wallet/WalletFactory";
import {AsyncBotDb} from "../common/asyncbotdb";
import {MoscaService} from "../../bot/common/clients/Mqtt";
const Queue = require("bee-queue");

export class WaitForParticipate implements IJob {
  public queue;
  private redeem;
  private mqtt: MoscaService;

  constructor() {
    this.queue = new Queue("bot-wait-for-participate");
    this.redeem = new Queue("bot-redeem");
    this.mqtt = new MoscaService();
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
      this.mqtt.waitForParticipate(data.data).catch((e) => {
        // console.log("Initiate error", e);
        // if (e.toString().indexOf("Error: Returned error: replacement transaction underpriced") !== -1) {
        //   const newWallet = WalletFactory.createWalletFromString(data.from);
        // }
        throw e;
        // return Observable.empty();
      }).subscribe(async (response) => {

        const waitJob = this.redeem.createJob(data);
        waitJob.retries(10).save().then((job) => {
          console.log(job);
        });

      });
    } else {
      return true;
    }
  }
}
