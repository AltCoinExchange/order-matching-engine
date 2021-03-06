import {isString} from "util";
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";
import * as mqtt from "mqtt";
import {InitiateData, InitiateParams} from "altcoinio-wallet";
import "rxjs/add/observable/of";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";

const INITIATE = "/inititate/";
const PARTICIPATE = "PARTICIPATE";
const BREDEEM = "BREDEEM";

export class MoscaService {
  public client;

  public messages: Subject<any> = new Subject();

  constructor(private appConfig) {
    this.client = mqtt.connect(appConfig.mqtt);
    this.client.on("message", (topic, message) => {
      this.messages.next({topic, message: message.toString()});
    });
  }

  public waitForInitiate(link): Observable<InitiateData> {
    const topic = INITIATE + (typeof link === "string" ? link : link.order_id);
    console.log("waitForInitiate", topic, link);
    this.subscribeToTopic(topic);
    return this.onMessage(topic).map((msg) => JSON.parse(msg.message));
  }

  public informInitiate(link, data: InitiateParams) {
    const topic = INITIATE + (typeof link === "string" ? link : link.order_id);
    this.sendMsg(topic, isString(data) ? data : JSON.stringify(data));
    return Observable.of(true);
  }

  public waitForParticipate(link): Observable<InitiateData> {
    const topic = PARTICIPATE + (typeof link === "string" ? link : link.order_id);
    console.log("waitForParticipate", topic, link, typeof link === "string" ? link : link.order_id);
    this.subscribeToTopic(topic);
    return this.onMessage(topic).map((msg) => JSON.parse(msg.message));
  }

  public informParticipate(link, data: InitiateParams) {
    const topic = PARTICIPATE + (typeof link === "string" ? link : link.order_id);
    console.log("informParticipate", topic, link);
    this.sendMsg(topic, isString(data) ? data : JSON.stringify(data));
    return Observable.of(true);
  }

  public waitForBRedeem(link): Observable<InitiateData> {
    const topic = BREDEEM + (typeof link === "string" ? link : link.order_id);
    console.log("waitForBRedeem", topic, link);
    this.subscribeToTopic(topic);
    return this.onMessage(topic).map((msg) => JSON.parse(msg.message));
  }

  public informBRedeem(link, data: InitiateParams) {
    const topic = BREDEEM + (typeof link === "string" ? link : link.order_id);
    console.log("informBRedeem", topic, link);
    this.sendMsg(topic, isString(data) ? data : JSON.stringify(data));
    return Observable.of(true);
  }

  private sendMsg(topic, data) {
    this.client.publish(topic, data);
  }

  private subscribeToTopic(topic) {
    this.client.subscribe(topic);
  }

  private onMessage(topic) {
    return this.messages.filter((data) => data.topic === topic);
  }
}
