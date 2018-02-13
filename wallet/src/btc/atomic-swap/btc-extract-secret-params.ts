import {ExtractSecretParams} from "../../atomic-swap";

export class BtcExtractSecretParams extends ExtractSecretParams {
  public hashedSecret;
  public redemptionTx;
  public extendedParams;

  constructor(hashedSecret, redemptionTx) {
    super();
    this.hashedSecret = hashedSecret;
    this.redemptionTx = redemptionTx;
  }
}
