export interface IOrder {
  id: string;
  sellCurrency: string;
  buyCurrency: string;
  status: string;
  buyerAddress: string;
  sellerAddress: string;
  sellAmount: number;
  buyAmount: number;
  expiration?: Date;
  wsId: number;
}
