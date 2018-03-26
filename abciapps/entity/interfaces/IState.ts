import {Channel} from '../Channel';
import {Currency} from '../Currency';

export interface IState {
  count: number;
  channels: Map<string, Channel>;
  currencies: Map<string, Currency>;
}