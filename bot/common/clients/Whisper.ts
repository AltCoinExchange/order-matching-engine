import {debug, isString} from 'util';
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";
import {InitiateData, InitiateParams} from "altcoinio-wallet";
import "rxjs/add/observable/of";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import * as Web3 from "web3/src";
import {AppConfig} from "../../config/app";

export class WhisperService {
  public client;
  private identity;
  protected web3: any;
  private topic: any;
  private sig: any;

  public messages: Subject<any> = new Subject();

  constructor(public configuration) {
    const wsProvider = new (Web3 as any).providers.WebsocketProvider(configuration.wshost);
    this.web3 = new Web3(wsProvider);
    this.web3.defaultAccount = configuration.defaultWallet;
    this.client = this.web3.shh;
    this.topic = this.web3.utils.fromAscii("altc");
  }

  /**
   * Add new identity
   * @returns {Promise<void>}
   * @constructor
   */
  public async Start() {
    console.log(await this.client.getInfo());
    this.identity = await this.client.generateSymKeyFromPassword("altcoinio");
    console.log(this.identity);

    await this.client.subscribe("messages", { topics: [this.topic], symKeyID: this.identity }).on("data", (data) => {
      const msg = { topic: data.topic, message:  JSON.parse(this.web3.utils.hexToAscii(data.payload.toString())) };
      this.messages.next(msg);
    });
  }

  public waitForInitiate(link): Observable<InitiateData> {
    console.log("waitForInitiate", this.topic, link);
    // this.subscribeToTopic(this.topic);
    return this.onMessage(this.topic, link.order_id).map((msg) => {
      return msg.message;
    });
  }

  public async informInitiate(link, data: InitiateParams) {
    (data as any).order_id = link.order_id;
    await this.sendMsg(this.topic, isString(data) ? data : JSON.stringify(data));
    return Observable.of(true);
  }

  public waitForParticipate(link): Observable<InitiateData> {
    console.log("waitForParticipate", this.topic, link);
    this.subscribeToTopic(this.topic);
    return this.onMessage(this.topic, link.order_id).map((msg) => msg.message);
  }

  public informParticipate(link, data: InitiateParams) {
    console.log("informParticipate", this.topic, link);
    this.sendMsg(this.topic, isString(data) ? data : JSON.stringify(data));
    return Observable.of(true);
  }

  public waitForBRedeem(link): Observable<InitiateData> {
    console.log("waitForBRedeem", this.topic, link);
    this.subscribeToTopic(this.topic);
    return this.onMessage(this.topic, link.order_id).map((msg) => JSON.parse(msg.message));
  }

  public async informBRedeem(link, data: InitiateParams) {
    console.log("informBRedeem", this.topic, link);
    await this.sendMsg(this.topic, isString(data) ? data : JSON.stringify(data));
    return Observable.of(true);
  }

  private async sendMsg(topic, data) {
    await this.send(topic, data);
  }

  private subscribeToTopic(topic) {
    this.client.subscribe(topic);
  }

  private onMessage(topic, oid) {
    return this.messages.filter((data) => data.topic === topic && data.message.order_id === oid);
  }

  /**
   * Send the message
   * @param topic (4 letter topic)
   * @param msg string
   * @returns {Promise<void>}
   */
  private async send(topic, msg) {
    await this.client.post({
      symKeyID: this.identity, // encrypts using the sym key ID
      // sig: this.sig, // signs the message using the keyPair ID
      ttl: 10,
      topic: this.topic,
      payload: this.web3.utils.fromAscii(msg),
      powTime: 3,
      powTarget: 0.5
    });
  }
}
