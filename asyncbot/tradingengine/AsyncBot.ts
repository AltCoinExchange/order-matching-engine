import {App} from "../config/app";
import {JobFactory} from "./JobFactory";
import {Bot} from "./Bot";
import {IJob} from '../../library/interfaces/IJob';
const Queue = require("bee-queue");

export class AsyncBot {
  public queue;
  private jobs: IJob[] = [];
  private bot: Bot;

  /**
   * Start the bot
   * @returns {Promise<void>}
   * @constructor
   */
  public async Start() {
    this.queue = new Queue("bot");
    this.jobs = JobFactory.CreateJobs(App.jobs, this.queue);
    this.bot = new Bot();
    await this.endProcess();
    await this.startJobs();
    await this.watchDog();
    console.log("Started listening for jobs");
  }

  /**
   * Start all processors (this could be on the separate
   * process or on the separate machine)
   */
  private async startJobs() {
    for (const i of this.jobs) {
      await i.Start();
    }

    await this.bot.Start();
  }

  /**
   * Watch for jobs if failed
   * @returns {Promise<void>}
   */
  private async endProcess() {
    this.queue.process("bot", async (job) => {
      this.bot.processingOrder = null;
    });
  }

  /**
   * Watch for whole process for inactive jobs
   * @returns {Promise<void>}
   */
  private async watchDog() {
    setInterval(async (e) => {
      const ids = {
        stalled: 0,
        waiting: 0,
        active: 0,
        succeeded: 0,
        failed: 0,
        delayed: 0,
        newestJob: 0
      };
      for (const j of this.jobs) {
        for (const q of j.GetQueues()) {
          const stalledJobs = await q.checkStalledJobs(300000);
          const activeJobs = await q.checkHealth(); // q.getJobs("active", {start: 0, end: 25});
          // const waitingJobs = await // q.getJobs("waiting", {start: 0, end: 25});
          ids.waiting = ids.waiting + activeJobs.waiting;
          ids.active = ids.active + activeJobs.active;
          ids.succeeded = ids.succeeded + activeJobs.succeeded;
          ids.failed = ids.failed + activeJobs.failed;
          ids.delayed = ids.delayed + activeJobs.delayed;
          ids.newestJob = ids.newestJob + activeJobs.newestJob;
          ids.stalled = ids.stalled + stalledJobs;
        }
      }
      console.log(ids);
      if (ids.active === 0) {
        this.bot.processingOrder = null;
      }
    }, App.watchdogSeconds * 1000);
  }
}
