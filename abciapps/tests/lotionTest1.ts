let lotion = require('lotion');

let app = lotion({
  initialState: {
    count: 0
  },
  logTendermint: true,
  // genesis: 'genesis.json',
  // peers: ['localhost:46660'],
  createEmptyBlocks: false,
  tendermintPort: 46657,
  p2pPort: 46658,
  // devMode: true
});

app.use((state, tx) => {
  if (state.count === tx.nonce) {
    state.count++;
  }
});

app.listen(3000).then(({ GCI }) => {
  console.log(GCI);
});
