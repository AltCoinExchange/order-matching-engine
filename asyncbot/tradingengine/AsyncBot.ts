import {IJob} from "../interfaces/job";
import {App} from "../config/app";
import {JobFactory} from "./JobFactory";
import {Bot} from "./Bot";
const Queue = require("bee-queue");

export class AsyncBot {
  public queue;
  private jobs: IJob[] = [];
  private bot: Bot;

  public async Start() {
    this.queue = new Queue("bot");
    this.jobs = JobFactory.CreateJobs(App.jobs, this.queue);
    this.bot = new Bot();
    await this.startJobs();
    console.log("Started listening for jobs");
  }

  /**
   * Start all jobs
   */
  private async startJobs() {
    for (const i of this.jobs) {
      i.Start();
    }

    await this.bot.Start();
  }
}
