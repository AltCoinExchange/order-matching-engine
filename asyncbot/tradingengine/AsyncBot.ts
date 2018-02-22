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
    await this.endProcess();
    await this.startJobs();
    await this.watchDog();
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

  /**
   * Watch for jobs if failed
   * @returns {Promise<void>}
   */
  private async endProcess() {
    this.queue.process("bot", async (job) => {
      this.bot.processingOrder = null;
    });
  }

  private async watchDog() {
    setInterval(async (e) => {
      const ids = {
        waiting: 0,
        active: 0,
        succeeded: 0,
        failed: 0,
        delayed: 0,
        newestJob: 0
      };
      for (const j of this.jobs) {
        for (const q of j.GetQueues()) {
          const activeJobs = await q.checkHealth(); // q.getJobs("active", {start: 0, end: 25});
          // const waitingJobs = await // q.getJobs("waiting", {start: 0, end: 25});
          ids.waiting = ids.waiting + activeJobs.waiting;
          ids.active = ids.active + activeJobs.active;
          ids.succeeded = ids.succeeded + activeJobs.succeeded;
          ids.failed = ids.failed + activeJobs.failed;
          ids.delayed = ids.delayed + activeJobs.delayed;
          ids.newestJob = ids.newestJob + activeJobs.newestJob;
        }
      }
      // console.log(ids);
      if (ids.active === 0) {
        this.bot.processingOrder = null;
      }
    }, 60000);
  }
}
