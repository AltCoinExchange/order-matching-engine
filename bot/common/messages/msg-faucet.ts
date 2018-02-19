import {MsgBase} from "./msg-base";

export interface IMsgFaucetData {
  coin: string;
  address: string;
}
export class MsgFaucet implements MsgBase {
  public type: string = "faucet";
  public data: IMsgFaucetData;

  public constructor(address: string, coin: string) {
    this.data = {} as IMsgFaucetData;
    this.data.address = address;
    this.data.coin = coin;
  }

  public toJson(): string {
    return JSON.stringify(this);
  }
}
