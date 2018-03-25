export const LibraryConfig = {
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
  db: {
    provider: "orbitdb", // Possible: orbitdb, mongodb
    orbitdb: {
      url: "/orbitdb/QmR9XEZwkq5GD79HxUV7n6QC71MGEyUpqVMWEj9nufjnYp/"
    },
    mongodb: {
      host: "",
    },
  }
};
