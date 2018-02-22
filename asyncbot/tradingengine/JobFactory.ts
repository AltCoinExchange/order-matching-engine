import {IJob} from "../interfaces/job";
import {Initiate} from "../jobs/initiate";
import {Redeem} from "../jobs/redeem";
import {InformInitiate} from "../jobs/informinitiate";
import {InformRedeem} from "../jobs/informredeem";
import {WaitForParticipate} from "../jobs/waitforparticipate";

export class JobFactory {
  public static CreateJob(jobName: string, queue): IJob {
    if (jobName === "initiate") {
      return new Initiate();
    } else if (jobName === "redeem") {
      return new Redeem();
    } else if (jobName === "informinitiate") {
      return new InformInitiate();
    } else if (jobName === "informredeem") {
      return new InformRedeem();
    } else if (jobName === "waitforparticipate") {
      return new WaitForParticipate();
    }
  }

  public static CreateJobs(jobs: string[], queue): IJob[] {
    const result = [];
    for (const i of jobs) {
      result.push(JobFactory.CreateJob(i, queue));
    }
    return result;
  }
}
