import {Initiate} from "../jobs/initiate";
import {Redeem} from "../jobs/redeem";
import {InformInitiate} from "../jobs/informinitiate";
import {InformRedeem} from "../jobs/informredeem";
import {WaitForParticipate} from "../jobs/waitforparticipate";
import {IJob} from '../../library/interfaces/IJob';

export class JobFactory {

  /**
   * Create processing job
   * @param {string} jobName
   * @param queue
   * @returns {IJob}
   * @constructor
   */
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

  /**
   * Create all processing jobs
   * @param {string[]} jobs
   * @param queue
   * @returns {IJob[]}
   * @constructor
   */
  public static CreateJobs(jobs: string[], queue): IJob[] {
    const result = [];
    for (const i of jobs) {
      result.push(JobFactory.CreateJob(i, queue));
    }
    return result;
  }
}
