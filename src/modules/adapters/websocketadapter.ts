import * as WebSocket from "ws";
import { WebSocketAdapter } from "@nestjs/common";
import { MessageMappingProperties } from "@nestjs/websockets";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/fromEvent";
import "rxjs/add/observable/empty";
import "rxjs/add/observable/from";
import "rxjs/add/observable/fromPromise";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/filter";
import {DbHelper} from "../helpers/db.helper";

export class WsAdapter implements WebSocketAdapter {
  private port: number = 3001;
  private clients: WebSocket[] = [];
  private clientBindings: Map<WebSocket, MessageMappingProperties[]>;
  public constructor(port: number) {
    this.port = port;
    this.clientBindings = new Map<WebSocket, MessageMappingProperties[]>();
  }

  public create(port: number) {
    if (port === 0 || port === undefined) {
      port = this.port;
    }
    return new WebSocket.Server({ port });
  }

  public broadcast(func, params?) {
    this.clientBindings.forEach((v, k) => {
      // Check if socket is active
      if (k.readyState === 1) {
        const event = v.find((x) => x.message === func);
        Observable.fromPromise(event.callback(k, params) as any).subscribe((result: any) => {
          try {
            if (result.value) {
              k.send(JSON.stringify(result.value));
            }
          } catch (e) {
            console.log("fljuus: ", e);
          }
        });
      }
    });
  }

  public broadcastMessage(params) {
    this.clientBindings.forEach((v, k) => {
      // Check if socket is active
      if (k.readyState === 1) {
        try {
          k.send(JSON.stringify(params));
        } catch (e) {
          console.log("fljuus: ", e);
        }
      }
    });
  }

  public bindClientConnect(server, callback: (...args: any[]) => void) {
    server.on("connection", (e) => {
      callback(e);
    });
  }

  public bindClientDisconnect(client, callback: (...args: any[]) => void) {
    client.on("close", async (e) => {
      // const closingWs = this.clientBindings.get(client);
      this.clientBindings.delete(client);
      // TODO: Handle active orders for disconnected clients and set order status
      await DbHelper.UpdateDisconnectedOrder(client._ultron.id);
      await this.broadcast("getActiveOrders");
      console.log("Disconnected");
      callback(e);
    });
  }

  public bindMessageHandlers(
    client: WebSocket,
    handlers: MessageMappingProperties[],
    process: (data: any) => Observable<any>,
  ) {
    this.clientBindings.set(client, handlers);
    Observable.fromEvent(client, "message")
      .switchMap((buffer) => this.bindMessageHandler(buffer, handlers, process))
      .filter((result) => !!result)
      .subscribe((response) => client.send(JSON.stringify(response)));
  }

  public bindMessageHandler(
    buffer,
    handlers: MessageMappingProperties[],
    process: (data: any) => Observable<any>,
  ): Observable<any> {
    try {
      const data = JSON.parse(buffer.data);
      const messageHandler = handlers.find(
        (handler) => handler.message === data.type,
      );
      if (!messageHandler) {
        return Observable.empty();
      }
      const {callback} = messageHandler;
      return process(callback({ wsAdapter: this, msg: data}));
    } catch (e) {
      return Observable.empty();
    }
  }
}
