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

@WebSocketGateway({ namespace: "events" })
export class EventsGateway {
  @WebSocketServer() public server;

  @SubscribeMessage("events")
  public onEvent(client, data): Observable<WsResponse<number>> {
    const event = "events";
    const response = [1, 2, 3]; // TODO

    return Observable.from(response).map((res) => ({ event, data: res }));
  }
}
