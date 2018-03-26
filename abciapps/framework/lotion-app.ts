import { apps } from './registry';
import { routes } from './route';

const lotion = require('lotion');

export class LotionApp {
  constructor() {
    apps.forEach((App) => new App());
    const app = lotion({
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
      routes[tx.action](state, tx.payload);
    });

    app.listen(3000).then(({GCI}) => {
      console.log(GCI);
    });
  }
}
