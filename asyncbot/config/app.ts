export const App = {
  jobs: ["initiate", "redeem", "informinitiate", "informredeem", "waitforparticipate"],
  watchdogSeconds: 60,
  queueGlobalConfig: {
    removeOnSuccess: true,
    removeOnFailure: true,
    stallInterval: 300000,
  },
};
