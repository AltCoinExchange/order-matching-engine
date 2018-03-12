import {isString} from "util";
import {Observable} from "rxjs/Observable";
import {InitiateData, InitiateParams} from "altcoinio-wallet";
import "rxjs/add/observable/of";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import {MoscaBase} from '../communication/MoscaBase';
import {IAtomicSwap} from './interfaces/IAtomicSwap';

const INITIATE = "/inititate/";
const PARTICIPATE = "PARTICIPATE";
const BREDEEM = "BREDEEM";

export class MoscaService extends MoscaBase implements IAtomicSwap {
  constructor(config?) {
    super(config);
  }

  public waitForInitiate(link): Observable<InitiateData> {
    const topic = INITIATE + (typeof link === "string" ? link : link.order_id);
    console.log("waitForInitiate", topic, link);
    this.subscribeToTopic(topic);
    return this.onMessage(topic).map((msg) => JSON.parse(msg.message));
  }

  public informInitiate(link, data: InitiateParams) {
    const topic = INITIATE + (typeof link === "string" ? link : link.order_id);
    this.send(topic, isString(data) ? data : JSON.stringify(data));
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
    this.send(topic, isString(data) ? data : JSON.stringify(data));
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
    this.send(topic, isString(data) ? data : JSON.stringify(data));
    return Observable.of(true);
  }
}
