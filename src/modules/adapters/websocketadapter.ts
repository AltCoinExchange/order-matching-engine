import * as WebSocket from "ws";
import { WebSocketAdapter } from "@nestjs/common";
import { MessageMappingProperties } from "@nestjs/websockets";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/fromEvent";
import "rxjs/add/observable/empty";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/filter";

export class WsAdapter implements WebSocketAdapter {
  private port: number = 3001;
  public constructor(port: number) {
    this.port = port;
  }

  public create(port: number) {
    if (port === 0 || port === undefined) {
      port = this.port;
    }
    return new WebSocket.Server({ port });
  }

  public bindClientConnect(server, callback: (...args: any[]) => void) {
    server.on("connection", callback);
  }

  public bindMessageHandlers(
    client: WebSocket,
    handlers: MessageMappingProperties[],
    process: (data: any) => Observable<any>,
  ) {
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
      return process(callback(data));
    } catch (e) {
      return Observable.empty();
    }
  }
}
