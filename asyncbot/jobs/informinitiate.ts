import {IJob} from "../interfaces/job";
import {Observable} from "rxjs/Observable";
import {IWallet, WalletFactory} from "../../bot/common/wallet/WalletFactory";
import {AsyncBotDb} from "../common/asyncbotdb";
import {MoscaService} from "../../bot/common/clients/Mqtt";
const Queue = require("bee-queue");

export class InformInitiate implements IJob {
  public queue;
  private waitForParticipate;
  private mqtt: MoscaService;

  constructor() {
    this.queue = new Queue("bot-inform-initiate");
    this.waitForParticipate = new Queue("bot-wait-for-participate");
    this.mqtt = new MoscaService();
  }

  public Start() {
    console.log("Starting inform initiate listening");
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
      this.mqtt.informInitiate(data.data, data.initData).catch((e) => {
        // console.log("Initiate error", e);
        // if (e.toString().indexOf("Error: Returned error: replacement transaction underpriced") !== -1) {
        //   const newWallet = WalletFactory.createWalletFromString(data.from);
        // }
        throw e;
        // return Observable.empty();
      }).subscribe(async (initData) => {

        const waitJob = this.waitForParticipate.createJob(data);
        waitJob.timeout(30000).save().then((job) => {
          console.log(job);
        });

      });
    } else {
      return true;
    }
  }
}
