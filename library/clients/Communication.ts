import {DappConfig} from "../config/app";
import {WhisperBase} from '../../bot/common/clients/WhisperBase';
import {ICommProvider} from '../interfaces/ICommProvider';
export class Communication implements ICommProvider {
  private commProvider: ICommProvider;
  constructor() {
    if (DappConfig.communication.type === "whisper") {
      this.commProvider = new WhisperBase(DappConfig.communication);
      this.commProvider.Start();
    }
  }

  public Start() {
    return this.commProvider.Start();
  }

  public subscribeHandler(data) {
    return this.commProvider.subscribeHandler(data);
  }

  public onMessage(topic, oid) {
    return this.commProvider.onMessage(topic, oid);
  }

  public send(topic, msg) {
    this.commProvider.send(topic, msg);
  }
}
