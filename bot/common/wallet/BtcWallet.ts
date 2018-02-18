import {IWallet} from "./WalletFactory";
import {BitcoinWallet} from "altcoinio-wallet";
import {
  ExtractSecretData, ExtractSecretParams, InitiateData, ParticipateData,
  RedeemData,
} from "altcoinio-wallet";
import {Observable} from "rxjs/Observable";
import {
  BtcExtractSecretParams, BtcInitiateParams, BtcParticipateParams,
  BtcRedeemParams,
} from "altcoinio-wallet";
import "rxjs/add/observable/fromPromise";

export class BtcWallet extends BitcoinWallet implements IWallet {

  private privKey: "";
  constructor(privateKey) {
    super();
    this.privKey = privateKey;
  }

  public Participate(data: InitiateData, amount: number): Observable<ParticipateData> {
    // tslint:disable-next-line
    console.log("PARTICIPATING BTC:... ", InitiateData);
    const btcParticipateParams = new BtcParticipateParams();
    btcParticipateParams.address = (data as any).address;
    btcParticipateParams.secretHash = data.secretHash;
    btcParticipateParams.amount = amount;
    btcParticipateParams.privateKey = this.privKey;
    btcParticipateParams.refundTime = 7200;
    console.log("btcParticipateParams", btcParticipateParams);
    return Observable.fromPromise(super.participate(btcParticipateParams));
  }

  public Initiate(address: string, amount: number): Observable<InitiateData> {
    const initParams = this.getInitParams(address, amount);
    return Observable.fromPromise(
      super.initiate(
        initParams,
      ),
    );
  }

  // public ExtractSecret(data: ExtractSecretParams): Observable<ExtractSecretData> {
  //   return Observable.fromPromise(super.extractSecret(new BtcExtractSecretParams(data.secretHash, data.contractTx)));
  // }

  public Redeem(data: RedeemData): Observable<RedeemData> {
    const redeemParams = this.getRedeemParams(this.unoxify(data.secret),
      this.unoxify(data.secretHash), data.contractBin, data.contractTx);
    return Observable.fromPromise(
      super.redeem(
        redeemParams,
      ),
    );
  }

  public getInitParams(address: string, amount: number): BtcInitiateParams {
    const wif = this.privKey;
    return new BtcInitiateParams(7200, wif, address, amount);
  }

  public getRedeemParams(secret: string, hashedsecret: string, contractBin, contractTx): BtcRedeemParams {
    const wif = this.privKey;
    return new BtcRedeemParams(wif, secret, hashedsecret, contractBin, contractTx);
  }

  public unoxify(param: string): string {
    return param.indexOf("0x") !== -1 ? param.slice(2) : param;
  }
}
