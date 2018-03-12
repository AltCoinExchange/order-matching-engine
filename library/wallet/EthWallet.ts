import {IWallet} from "./WalletFactory";
import {
  ExtractSecretData, ExtractSecretParams, InitiateData, ParticipateData,
  RedeemData, EthereumWallet, TokenAtomicSwap, BtcExtractSecretParams,
  EthInitiateParams, EthParticipateParams, EthRedeemParams, TokenFactory, TOKENS,
} from "altcoinio-wallet";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/fromPromise";

export class EthWallet extends EthereumWallet implements IWallet {
  public readonly timeout: number = 7200;
  private privKey: "";

  constructor(privateKey) {
    super();
    this.privKey = privateKey;
  }

  public Initiate(address: string, amount: number): Observable<InitiateData> {
    return Observable.fromPromise(super.initiate(this.getInitParams(address, amount.toString())));
  }

  // public ExtractSecret(data: ExtractSecretParams): Observable<ExtractSecretData> {
  //   return Observable.fromPromise(super.extractSecret(new BtcExtractSecretParams(data.secretHash, data.contractTx)));
  // }

  public Participate(data: InitiateData, amount: number): Observable<ParticipateData> {
    // tslint:disable-next-line
    console.log("PARTICIPATING ETH:... ", InitiateData);
    const xprivKey = this.init();

    const secretHash = data.secretHash;
    const participateParams = new EthParticipateParams(this.timeout,
      this.oxify(secretHash),
      data.address,
      amount.toString(), xprivKey);

    return Observable.fromPromise(super.participate(participateParams));
  }

  public Redeem(data: RedeemData): Observable<RedeemData> {
    this.init();
    const params = new EthRedeemParams(this.oxify(data.secret), this.oxify(data.secretHash), null);
    return Observable.fromPromise(super.redeem(params));
  }

  private getInitParams(address: string, amount: string): EthInitiateParams {
    return new EthInitiateParams(this.timeout, address, amount.toString());
  }

  private oxify(param: string): string {
    return param.indexOf("0x") === -1 ? "0x" + param : param;
  }

  public init(): string {
    const xprivKey = this.privKey;
    const keystore = super.recover(xprivKey);
    super.login(keystore);
    return xprivKey;
  }

  public getERC20Token(token: TOKENS): TokenAtomicSwap {
    return TokenFactory.GetToken(token, this.engine);
  }
}
