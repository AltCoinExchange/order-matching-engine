import { Channel } from '../entity/Channel';
import { apps } from './registry';
import { routes } from './route';
import { Currency } from '../entity/Currency';
import {IState} from '../entity/interfaces/IState';
import {MatchedOrder} from '../entity/MatchedOrder';
import * as Web3 from "web3/src";
const lotion = require('lotion');

export class LotionApp {
  // Ethereum web3
  protected web3: any;

  constructor(configuration) {

    // Initialize ETH
    const wsProvider = new (Web3 as any).providers.WebsocketProvider(configuration.wshost);
    this.web3 = new Web3(wsProvider);

    // Create lotion APP
    // apps.forEach((App) => new App());
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
