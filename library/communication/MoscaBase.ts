import {isString} from "util";
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";
import * as mqtt from "mqtt";
import {InitiateData, InitiateParams} from "altcoinio-wallet";
import "rxjs/add/observable/of";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import {LibraryConfig} from '../config/app';
import {ICommProvider} from '../interfaces/ICommProvider';

export class MoscaBase implements ICommProvider {

  private url;
  public client;

  public Start() {
    this.client = mqtt.connect(this.url);
    this.client.on("message", (topic, message) => {
      this.messages.next({topic, message: message.toString()});
    });
  }

  /**
   * Send message
   * @param topic
   * @param data
   */
  public send(topic, msg) {
    this.client.publish(topic, msg);
  }

  /**
   * Receive subject
   * @type {Subject<any>}
   */
  public messages: Subject<any> = new Subject();

  constructor(public config?) {
    if (config) {
      this.url = config.mqtt;
    } else {
      this.url = LibraryConfig.communication.mqtt;
    }
  }

  /**
   * Subscribe to topic
   * @param topic
   */
  protected subscribeToTopic(topic) {
    this.client.subscribe(topic);
  }

  /**
   * Event on message
   * @param topic
   * @returns {Observable<any>}
   */
  public onMessage(topic) {
    return this.messages.filter((data) => data.topic === topic);
  }
}
