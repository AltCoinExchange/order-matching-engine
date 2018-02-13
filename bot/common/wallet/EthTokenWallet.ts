import {EthereumWallet, TokenAtomicSwap} from "../../../wallet/src/eth";
import {IWallet} from "./WalletFactory";
import {TokenFactory, TOKENS} from "../../../wallet/src/eth-tokens";
import {Observable} from "rxjs/Observable";
import {
  ExtractSecretData, ExtractSecretParams, InitiateData, ParticipateData,
  RedeemData,
} from "../../../wallet/src/atomic-swap";
import {BtcExtractSecretParams} from "../../../wallet/src/btc/atomic-swap";
import {EthInitiateParams, EthParticipateParams, EthRedeemParams} from "../../../wallet/src/eth/atomic-swap";

export class EthTokenWallet extends EthereumWallet implements IWallet {
  private readonly timeout: number = 7200;
  public token: TOKENS;
  private privKey: "";

  constructor(privateKey, token: TOKENS) {
    super();
    this.token = token;
    this.privKey = privateKey;
  }

  public Initiate(address: string, amount: number): Observable<InitiateData> {
    const token = this.getERC20Token(this.token);
    const initParams = this.getInitParams(address, amount.toString());
    return Observable.fromPromise(token.initiate(initParams));
  }

  public ExtractSecret(data: ExtractSecretParams): Observable<ExtractSecretData> {
    return Observable.fromPromise(super.extractSecret(new BtcExtractSecretParams(data.secretHash, data.contractTx)));
  }

  public Participate(data: InitiateData, amount: number): Observable<ParticipateData> {
    // tslint:disable-next-line
    console.log("PARTICIPATING ETH:... ", InitiateData);
    const xprivKey = this.init();

    const token = this.getERC20Token(this.token);

    const secretHash = data.secretHash;
    const participateParams = new EthParticipateParams(this.timeout,
      this.oxify(secretHash),
      data.address,
      amount.toString(), xprivKey);

    return Observable.fromPromise(token.participate(participateParams));
  }

  public Redeem(data: RedeemData): Observable<RedeemData> {
    this.init();
    const params = new EthRedeemParams(this.oxify(data.secret), this.oxify(data.secretHash), null);
    const token = this.getERC20Token(this.token);
    return Observable.fromPromise(token.redeem(params));
  }

  private getInitParams(address: string, amount: string): EthInitiateParams {
    return new EthInitiateParams(this.timeout, address, amount.toString());
  }

  public oxify(param: string): string {
    return param.indexOf("0x") === -1 ? "0x" + param : param;
  }

  public init(): string {
    const keystore = super.recover(this.privKey);
    this.login(keystore);
    return this.privKey;
  }

  public getERC20Token(token: TOKENS): TokenAtomicSwap {
    return TokenFactory.GetToken(token, this.engine);
  }
}
