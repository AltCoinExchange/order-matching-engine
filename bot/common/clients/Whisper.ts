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
  private sig: any;

  // TOPICS
  private initTopic: any;
  private participateTopic: any;
  private redeemTopic: any;

  public messages: Subject<any> = new Subject();

  constructor(public configuration) {
    const wsProvider = new (Web3 as any).providers.WebsocketProvider(configuration.wshost);
    this.web3 = new Web3(wsProvider);
    this.web3.defaultAccount = configuration.defaultWallet;
    this.client = this.web3.shh;
    this.initTopic = this.web3.utils.fromAscii("alti");
    this.participateTopic = this.web3.utils.fromAscii("altp");
    this.redeemTopic = this.web3.utils.fromAscii("altr");
  }

  /**
   * Add new identity
   * @returns {Promise<void>}
   * @constructor
   */
  public async Start() {
    // console.log(await this.client.getInfo());
    this.identity = await this.client.generateSymKeyFromPassword("altcoinio");

    // Setup handlers (issue at the web3 - cannot subscribe to multiple topics
    for (const i of [this.initTopic, this.participateTopic, this.redeemTopic]) {
      await this.client.subscribe("messages", { topics: [i], symKeyID: this.identity }).on("data", (data) => this.subscribeHandler(data));
    }
  }

  /**
   * Subscribe handler
   * @param data
   */
  private subscribeHandler(data) {
    const msg = {
      topic: data.topic,
      message:  JSON.parse(this.web3.utils.hexToAscii(data.payload.toString())),
    };
    this.messages.next(msg);
  }

  /**
   * Wait for initiate for specific order id
   * @param link
   * @returns {Observable<InitiateData>}
   */
  public waitForInitiate(link): Observable<InitiateData> {
    console.log("waitForInitiate", this.initTopic, link);
    return this.onMessage(this.initTopic, link.order_id).map((msg) => msg.message);
  }

  /**
   * Inform initate using order id
   * @param link
   * @param {InitiateParams} data
   * @returns {Promise<Observable<boolean>>}
   */
  public async informInitiate(link, data: InitiateParams) {
    (data as any).order_id = link.order_id;
    await this.send(this.initTopic, isString(data) ? data : JSON.stringify(data));
    return Observable.of(true);
  }

  /**
   * Wait for participate for specific order id
   * @param link
   * @returns {Observable<InitiateData>}
   */
  public waitForParticipate(link): Observable<InitiateData> {
    console.log("waitForParticipate", this.participateTopic, link);
    return this.onMessage(this.participateTopic, link.order_id).map((msg) => msg.message);
  }

  /**
   * Inform participate using order id
   * @param link
   * @param {InitiateParams} data
   * @returns {Promise<Observable<boolean>>}
   */
  public async informParticipate(link, data: InitiateParams) {
    (data as any).order_id = link.order_id;
    await this.send(this.participateTopic, isString(data) ? data : JSON.stringify(data));
    return Observable.of(true);
  }

  /**
   * Wait for redeem usig order id
   * @param link
   * @returns {Observable<InitiateData>}
   */
  public waitForBRedeem(link): Observable<InitiateData> {
    console.log("waitForBRedeem", this.redeemTopic, link);
    return this.onMessage(this.redeemTopic, link.order_id).map((msg) => msg.message);
  }

  /**
   * Inform redeem using order id
   * @param link
   * @param {InitiateParams} data
   * @returns {Promise<Observable<boolean>>}
   */
  public async informBRedeem(link, data: InitiateParams) {
    (data as any).order_id = link.order_id;
    console.log("informBRedeem", this.redeemTopic, link);
    await this.send(this.redeemTopic, isString(data) ? data : JSON.stringify(data));
    return Observable.of(true);
  }

  /**
   * Filter orders
   * @param topic
   * @param oid
   * @returns {Observable<any>}
   */
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
      topic,
      payload: this.web3.utils.fromAscii(msg),
      powTime: 3,
      powTarget: 0.5
    });
  }
}
