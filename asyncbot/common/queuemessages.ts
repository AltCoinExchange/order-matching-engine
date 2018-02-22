const Queue = require("bee-queue");

export class QueueMessages {

  /**
   * Initiate done job
   * @param msg
   * @returns {Promise<void>}
   * @constructor
   */
  public static async BotDone(msg?) {
    const botQueue = new Queue("bot", {removeOnSuccess: true, removeOnFailure: true});
    const waitJob = botQueue.createJob(msg);
    await waitJob.save();
  }
}
