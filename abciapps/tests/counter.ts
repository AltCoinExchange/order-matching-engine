import { Route } from '../framework/route';
import {IState} from '../entity/interfaces/IState';
import {Channel} from '../entity/Channel';

export class Counter {
  @Route('increment')
  public increment(state: IState, payload): void {
    state.count++;
  }

  @Route('openChannel')
  public openChannel(state: IState, payload): void {
    state.channels.set("", new Channel());
  }

  @Route('closeChannel')
  public closeChannel(state: IState, payload): void {
    state.channels.set("", new Channel());
  }

  @Route('trade')
  public trade(state: IState, payload): void {
    state.count++;
  }
}
