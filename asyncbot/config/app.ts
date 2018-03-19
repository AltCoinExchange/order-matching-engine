export const App = {
  jobs: ["initiate", "redeem", "informinitiate", "informredeem", "waitforparticipate"],
  watchdogSeconds: 60,
  queueGlobalConfig: {
    removeOnSuccess: true,
    removeOnFailure: true,
    stallInterval: 300000,
  },
  communication: {
    type: "mqtt",
    whisper: {
      wshost: "ws://localhost:8546",
      ttl: 10,
      powTime: 3,
      powTarget: 0.5,
      symKeyPassword: "altcoinio"
    },
    mqtt: "wss://swap.altcoin.io:3001/",
  },
  wsOrderApi: "ws://localhost:3002",
};