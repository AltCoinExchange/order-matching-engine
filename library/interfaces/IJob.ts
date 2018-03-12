export interface IJob {
  /**
   * Start the job
   */
  Start();

  /**
   * Get used queues
   * @returns {any[]}
   */
  GetQueues(): any[];
}
