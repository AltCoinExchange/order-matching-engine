import { Signature } from './Signature';

export class Receipt {
  public nonce: number;

  public amount: string;

  public signature: Signature;

  public signatureDex: Signature;
}
