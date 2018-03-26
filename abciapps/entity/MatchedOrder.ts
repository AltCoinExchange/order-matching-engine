/**
 * Rate model is based on liquidity of the system.
 */
export class MatchedOrder {
  public Id: string;
  public makerChannelId: string;
  public takerChannelId: string;
  public makerValue: number;
  public takerValue: number;
  // TODO: this should be in the block
  public timeStamp: number;
}
