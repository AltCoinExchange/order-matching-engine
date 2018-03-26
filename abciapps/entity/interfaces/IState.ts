import {Channel} from '../Channel';
import {Currency} from '../Currency';
import {MatchedOrder} from '../MatchedOrder';

export interface IState {
  count: number;
  channels: Map<string, Channel>;
  currencies: Map<string, Currency>;
  matchedOrders: Map<string, MatchedOrder>;
}
