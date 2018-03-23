const lotion2 = require('lotion');

const app2 = lotion2({
  initialState: {
    count: 0
  },
  logTendermint: true,
  genesis: 'genesis.json',
  // peers: ['localhost:46660'],
  createEmptyBlocks: false,
  tendermintPort: 46651,
  p2pPort: 46652,
  // devMode: true
});

app2.use((state, tx) => {
  if (state.count === tx.nonce) {
    state.count++;
  }
});

app2.listen(3001).then(({ GCI }) => {
  console.log(GCI);
});
