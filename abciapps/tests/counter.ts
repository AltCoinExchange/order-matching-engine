import { Route } from '../framework/route';

export class Counter {
  @Route('increment')
  public increment(state, payload): void {
    state.count++;
  }
}
