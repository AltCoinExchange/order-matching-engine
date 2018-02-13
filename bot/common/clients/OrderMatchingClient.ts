import {ReplaySubject} from "rxjs/ReplaySubject";
import {Observable} from "rxjs/Observable";

const W3CWebSocket = require("websocket").w3cwebsocket;

export class OrderMatchingClient {

  private client: any;
  private dataSubject = new ReplaySubject<any>();

  constructor() {
    this.client = new W3CWebSocket("ws://localhost:3002");
    this.client.onerror = this.onConnectFailed;
    this.client.onopen = this.onConnectSuccess;
    this.client.onclose = this.onConnectClose;
    this.client.onmessage = this.onMessage;
  }

  public OrderSubscribe(): Observable<any> {
    return this.dataSubject.asObservable();
  }

  private onMessage(msg) {
    const jsonMsg = JSON.parse(msg);
    if (jsonMsg.message === "getActiveOrders") {
      this.dataSubject.next(jsonMsg.data);
      console.log("Message received: ", msg);
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
}
