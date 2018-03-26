import { Channel } from '../entity/Channel';
import { apps } from './registry';
import { routes } from './route';
import { Currency } from '../entity/Currency';
import {IState} from '../entity/interfaces/IState';
import {MatchedOrder} from '../entity/MatchedOrder';

const lotion = require('lotion');

export class LotionApp {
  constructor() {
    apps.forEach((App) => new App());
    const app = lotion({
      initialState: {
        count: 0,
        channels: {},
        currencies: new Map<string, Currency>(),
        matchedOrders: new Map<string, MatchedOrder>()
      } as IState,
      logTendermint: true,
      // genesis: 'genesis.json',
      // peers: ['localhost:46660'],
      createEmptyBlocks: false,
      tendermintPort: 46657,
      p2pPort: 46658,
      // devMode: true
    });

    app.use((state: IState, tx) => {
      routes[tx.action](state, tx.payload);
    });

    app.listen(3000).then(({GCI}) => {
      console.log(GCI);
    });
  }
}
