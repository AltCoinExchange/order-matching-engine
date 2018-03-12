import {isString} from 'util';
import {Observable} from "rxjs/Observable";
import {InitiateData, InitiateParams} from "altcoinio-wallet";
import "rxjs/add/observable/of";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import {WhisperBase} from '../communication/WhisperBase';
import {IAtomicSwap} from './interfaces/IAtomicSwap';

export class WhisperService extends WhisperBase implements IAtomicSwap {
  // TOPICS
  private initTopic: any;
  private participateTopic: any;
  private redeemTopic: any;

  constructor(public configuration) {
    super(configuration);
    this.initTopic = this.web3.utils.fromAscii("alti");
    this.participateTopic = this.web3.utils.fromAscii("altp");
    this.redeemTopic = this.web3.utils.fromAscii("altr");
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
}
