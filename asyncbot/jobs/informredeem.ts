import {IJob} from "../interfaces/job";
import {Observable} from "rxjs/Observable";
import {IWallet, WalletFactory} from "../../bot/common/wallet/WalletFactory";
import {AsyncBotDb} from "../common/asyncbotdb";
import {MoscaService} from "../../bot/common/clients/Mqtt";
const Queue = require("bee-queue");

export class InformRedeem implements IJob {
  public queue;
  private waitForParticipate;
  private mqtt: MoscaService;

  constructor() {
    this.queue = new Queue("bot-inform-redeem");
    this.mqtt = new MoscaService();
  }

  public Start() {
    console.log("Starting inform redeem listening");
    this.queue.process("initiate", async (job) => {
      return await this.informRedeem(job.data);
    });
  }

  /**
   * Wallet initiate
   * @param {IWallet} wallet
   * @param data
   */
  private async informRedeem(data) {
    if (AsyncBotDb.isOrderActive(data)) {
      this.mqtt.informBRedeem(data.data, data.redeemData).catch((e) => {
        // console.log("Initiate error", e);
        // if (e.toString().indexOf("Error: Returned error: replacement transaction underpriced") !== -1) {
        //   const newWallet = WalletFactory.createWalletFromString(data.from);
        // }
        throw e;
        // return Observable.empty();
      }).subscribe(async (informed) => {
        return true;
      });
    } else {
      return true;
    }
  }
}
