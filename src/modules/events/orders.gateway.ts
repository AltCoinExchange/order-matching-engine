import {
  WebSocketGateway,
  SubscribeMessage,
  WsResponse,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/from";
import "rxjs/add/observable/of";
import "rxjs/add/operator/map";
import {Collections, DbHelper} from "../helpers/db.helper";
import {IOrder} from "../helpers/long-poll.service";
import {WsAdapter} from "../adapters/websocketadapter";

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

  private async addOrder(client, data): Promise<IOrder> {
    const order = {
      id: data.id,
      wsId: client._ultron.id,
      sellCurrency: data.from,
      buyCurrency: data.to,
      sellAmount: data.fromAmount,
      buyAmount: data.toAmount,
      sellerAddress: data.address,
      status: "new",
    } as IOrder;

    let dbOrder = await DbHelper.GetOrderWithId(data.id);
    if (!dbOrder) {
      dbOrder = await DbHelper.PutOrder(order);
    }

    return order;
  }

  /**
   * Match order and broadcast both orders
   * @param {WsAdapter} adapter
   * @param {IOrder} order
   * @returns {Promise<void>}
   */
  private async matchOrder(adapter: WsAdapter, order: IOrder) {
    const currentOrders = await DbHelper.GetMatchedOrders(order);

    if (currentOrders.length > 0) {
      const matchedOrder = currentOrders[0];

      const sideAResponse = {
        message: "matchOrder",
        data: {
          id: matchedOrder.id,
          order_id: matchedOrder.id,
          side: "a",
        },
      };
      const sideBResponse = {
        message: "matchOrder",
        data: {
          id: order.id,
          order_id: matchedOrder.id,
          side: "b",
          address: order.sellerAddress,
          depositAmount: order.sellAmount,
          from: order.buyCurrency,
          to: order.sellCurrency,
        },
      };

      await DbHelper.UpdateOrderStatus(order.id, "pending", matchedOrder.sellerAddress);
      await DbHelper.UpdateOrderStatus(matchedOrder.id, "pending", order.sellerAddress);

      adapter.broadcastMessage(sideAResponse);
      adapter.broadcastMessage(sideBResponse);
    }

    adapter.broadcast("getActiveOrders");
  }

  @SubscribeMessage("setOrder")
  public async onSetOrder(client, data): Promise<Observable<WsResponse<any>>> {
    const responseObj = {} as any;
    responseObj.message = "setOrder";

    // Add order
    const order = await this.addOrder(client, data.msg.data);

    // Find match for order and broadcast message
    await this.matchOrder(data.wsAdapter, order);

    responseObj.data = order;
    return Observable.of(responseObj);
  }

  @SubscribeMessage("getActiveOrders")
  public async onActiveOrdersEvent(client, data): Promise<Observable<WsResponse<any>>> {
    const coll = await DbHelper.GetCollection(Collections.ORDERS);
    const now = new Date(Date.now());
    const responseObj = {} as any;
    responseObj.data = [];
    responseObj.message = "getActiveOrders";

    const orders = await coll.aggregate([
      { $match : { status: "new", expiration: { $gte: now }}},
      { $project: { id: 1, expiration: 1, from: "$sellCurrency", to: "$buyCurrency",
          fromAmount: "$sellAmount", toAmount: "$buyAmount", address: "$sellerAddress"}},
    ]).toArray();

    responseObj.data = orders;

    await coll.conn.close();
    return Observable.of(responseObj);
  }

  @SubscribeMessage("getLatestOrders")
  public async onLatestOrdersEvent(client, data): Promise<Observable<WsResponse<any>>> {
    const coll = await DbHelper.GetCollection(Collections.ORDERS);
    const responseObj = {} as any;
    responseObj.data = [];
    responseObj.message = "getLatestOrders";

    const orders = await coll.aggregate([
      { $sort : { expiration: -1 }},
      { $project: { id: 1, expiration: 1, from: "$sellCurrency", to: "$buyCurrency",
          fromAmount: "$sellAmount", toAmount: "$buyAmount" }},
    ]).toArray();

    responseObj.data = orders;

    await coll.conn.close();
    return Observable.of(responseObj);
  }
}
