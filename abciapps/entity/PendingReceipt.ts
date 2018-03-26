import { Entity } from 'typeorm/decorator/entity/Entity';
import { ReceiptDto } from '../../dto/receipt.dto';
import { Signature } from './Signature';

export class PendingReceipt {
  public orderId: string;

  public amount: string;

  public nonce: string;

  public signature: Signature;
}
