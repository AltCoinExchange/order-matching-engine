import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/of";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import * as Web3 from "web3/src";
import {ICommProvider} from '../interfaces/ICommProvider';

export class WhisperBase implements ICommProvider {
  public client;
  public identity;
  protected web3: any;
  public sig: any;

  // TOPICS
  private topics = [];

  public messages: Subject<any> = new Subject();

  constructor(public configuration) {
    const wsProvider = new (Web3 as any).providers.WebsocketProvider(configuration.wshost);
    this.web3 = new Web3(wsProvider);
    this.web3.defaultAccount = configuration.defaultWallet;
    this.client = this.web3.shh;
  }

  /**
   * Add new identity
   * @returns {Promise<void>}
   * @constructor
   */
  public async Start() {
    // console.log(await this.client.getInfo());
    this.identity = await this.client.generateSymKeyFromPassword(this.configuration.symKeyPassword);

    // Setup handlers (issue at the web3 - cannot subscribe to multiple topics
    for (const i of this.topics) {
      await this.client.subscribe("messages", { topics: [i], symKeyID: this.identity }).on("data", (data) => this.subscribeHandler(data));
    }
  }

  /**
   * Subscribe handler
   * @param data
   */
  public subscribeHandler(data) {
    const msg = {
      topic: data.topic,
      message:  JSON.parse(this.web3.utils.hexToAscii(data.payload.toString())),
    };
    this.messages.next(msg);
  }

  /**
   * Filter orders
   * @param topic
   * @param oid
   * @returns {Observable<any>}
   */
  public onMessage(topic, oid) {
    return this.messages.filter((data) => data.topic === topic && data.message.order_id === oid);
  }

  /**
   * Send the message
   * @param topic (4 letter topic)
   * @param msg string
   * @returns {Promise<void>}
   */
  public async send(topic, msg) {
    await this.client.post({
      symKeyID: this.identity, // encrypts using the sym key ID
      // sig: this.sig, // signs the message using the keyPair ID
      ttl: this.configuration.ttl,
      topic,
      payload: this.web3.utils.fromAscii(msg),
      powTime: this.configuration.powTime,
      powTarget: this.configuration.powTarget
    });
  }
}
