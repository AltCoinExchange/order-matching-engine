import {
  WebSocketGateway,
  SubscribeMessage,
  WsResponse,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/from";
import "rxjs/add/operator/map";
import {Collections, DbHelper} from "../helpers/db.helper";

@WebSocketGateway({ namespace: "orders" })
export class OrdersGateway {
  @WebSocketServer() public server;

  @SubscribeMessage("addOrder")
  public async onEvent(client, data): Promise<Observable<WsResponse<any>>> {
    const event = "orders";
    const response = [];

    // TODO: Check for fake address
    // TODO: Check for inactive clients
    // TODO: Check for address
    // TODO: Check for coin amount
    // TODO: Check for expired orders
    // TODO: Retrieve list of the orders
    const coll = await DbHelper.GetCollection(Collections.ORDERS);
    const record = {} as any;
    record.status = "new"; // Statuses: new, pending, broken
    record.expiration = new Date(data.expiration); // TODO: Fixed amount
    record.sellerAddress = data.address;
    record.sellValue = parseFloat(data.sellValue);
    record.currency = data.sellCurrency;
    record.buyValue = parseFloat(data.buyValue);
    record.buyCurrency = data.buyCurrency;
    record.buyerAddress = "";
    const result = await coll.insertOne(record);
    return Observable.from(response).map((res) => ({ event, data: res }));
  }

  @SubscribeMessage("getActiveOrders")
  public async onActiveOrdersEvent(client, data): Promise<Observable<WsResponse<any>>> {
    const coll = await DbHelper.GetCollection(Collections.ORDERS);
    const now = new Date(Date.now());
    const response = [];
    const orders = await coll.aggregate([
      { $match : { status: "new", expiration: { $gte: now }}},
      { $project: { id: 1, expiration: 1, from: "$sellCurrency", to: "$buyCurrency",
          fromAmount: "$sellAmount", toAmount: "$buyAmount", address: "$sellerAddress"}},
    ]).toArray();

    response.push(orders);
    await coll.conn.close();
    return Observable.from(response);
  }
}
