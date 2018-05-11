import { Route } from '../framework/route';
import {IState} from '../entity/interfaces/IState';
import {Channel} from '../entity/Channel';
import {LotionApp} from '../framework/lotion-app';

export class PaymentChannelsApp extends LotionApp {
  @Route('openChannel')
  public async openChannel(state: IState, payload): Promise<void> {
    // TODO: Add web3 with signed transaction
    // const pl = {
    //   currency: "GNO",
    //   amount: "1"
    // };
    // TODO: If state is repeatable then check for the current block
    // TODO: get signedTx and receipt confirmation (at least 6)
    const result = await this.web3.eth.sendSignedTransaction(payload.signedTx);

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
