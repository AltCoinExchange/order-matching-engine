export class ExtractSecretParams {
  public secretHash: string;
  public contractTx: string;

  constructor(secretHash?: string, contractTx?: string) {
    this.secretHash = secretHash;
    this.contractTx = contractTx;
  }
}
