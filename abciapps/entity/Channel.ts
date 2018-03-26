import { Receipt } from './Receipt';

export class Channel {
  public email: string;

  public channelId: string;

  public address: string;

  public token: string;

  public receipts: Receipt[];
}
