import {ReplaySubject} from "rxjs/ReplaySubject";
import {Observable} from "rxjs/Observable";
import {IOrder} from "../../../src/modules/helpers/long-poll.service";
import {MsgOrder} from "../messages/msg-order";
import {AppConfig} from "../../config/app";

const W3CWebSocket = require("websocket").w3cwebsocket;

export class OrderMatchingClient {

  private client: any;
  private dataSubject = new ReplaySubject<any[]>();
  private matchedSubject = new ReplaySubject<any>();
  private faucetSubject = new ReplaySubject<any>();
  private id: number;
  private static instance: OrderMatchingClient;

  constructor() {
    this.client = new W3CWebSocket(AppConfig.wsOrderApi);
    this.client.onerror = this.onConnectFailed;
    this.client.onopen = this.onConnectSuccess;
    this.client.onclose = this.onConnectClose;
    this.client.onmessage = this.onMessage;
    this.id = Math.round(Math.random() * 1000);
    OrderMatchingClient.instance = this;
  }

  public static GetInstance(): OrderMatchingClient {
    return OrderMatchingClient.instance;
  }

  public OrderSubscribe(): Observable<any[]> {
    return this.dataSubject.asObservable();
  }

  public OrderMatchSubscribe(): Observable<any> {
    return this.matchedSubject.asObservable();
  }

  public FaucetSubscribe(): Observable<any> {
    return this.faucetSubject.asObservable();
  }

  public SendOrder(order: IOrder) {
    const newOrder = new MsgOrder(order.id, order.sellerAddress, order.sellCurrency,
      order.buyCurrency, order.sellAmount, order.buyAmount).toJson();

    this.client.send(newOrder);
  }

  private onMessage(msg) {
    const jsonMsg = JSON.parse(msg.data);
    if (jsonMsg.message === "getActiveOrders") {
      OrderMatchingClient.GetInstance().dataSubject.next(jsonMsg.data);
    } else if (jsonMsg.message === "matchOrder") {
      OrderMatchingClient.GetInstance().matchedSubject.next(jsonMsg.data);
    } else if (jsonMsg.message === "faucet") {
      OrderMatchingClient.GetInstance().faucetSubject.next(jsonMsg.data);
    }
  }

  private onConnectSuccess() {
    console.log("Connected");
  }

  private onConnectClose() {
    console.log("Disconnected");
  }

  private onConnectFailed(error) {
    console.log(error);
  }

  public GetId(): number {
    return this.id;
  }
}
