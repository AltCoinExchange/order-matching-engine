import { InitiateData, ParticipateData, RedeemData } from "altcoinio-wallet";
import { Observable } from "rxjs/Observable";
import { AppConfig } from "../../config/app";
import { BtcWallet } from "./BtcWallet";
import { EthTokenWallet } from "./EthTokenWallet";
import { EthWallet } from "./EthWallet";

export enum Coins {
  BTC,
  ETH,
  DCR,
  REP,
  GNO,
  GNT,
  LTC,
  BAT,
  EOS,
  SALT,
  ANT,
  CVC,
  DNT,
  SNT,
  SUB,
  TRX,
  OMG,
  BTM,
  DENT,
  PPT,
  MKR,
  DGD,
  QASH,
  ETHOS,
  FUN,
  ZRX,
  REQ,
  BNT,
  ICN,
  PAY,
  STORJ,
  ENJ,
  MCO,
  EDG,
  VEN,
  ICX,
}

export enum TOKENS {
  AUGUR = 1,
  GOLEM,
  GNOSIS,
  BAT,
  ARAGON,
  EOS,
  SALT,
  CIVIC,
  OMISEGO,
  DISTRICT0X,
  STATUSNETWORK,
  SUBSTRATUM,
  TRON,
  BYTOM,
  DENT,
}

export interface IWalletRecord {
  address: string;
  balance: string;
  name: string;
  loading: boolean;
}

export abstract class Coin {
  public readonly derive: string;
  public readonly type: Coins;
  public readonly name: string;
  public readonly fullName: string;
  public readonly icon: string;
  public amount: number;
  public faucetLoading: boolean = false;
  public $amountUSD: Observable<number>;
  public walletRecord: IWalletRecord;

  public abstract update(coin: Coin): Coin;

}

export interface IWallet {
  Initiate(address: string, amount: number): Observable<InitiateData>;

  Participate(data: InitiateData, amount: number): Observable<ParticipateData>;

  Redeem(data: RedeemData): Observable<RedeemData>;

  // ExtractSecret(data: ExtractSecretParams): Observable<ExtractSecretData>;

  getAddress(wif?);
}

export class WalletFactory {
  public static createWalletFromString(coin: string) {
    return this.createWallet(Coins[coin]);
  }
  public static createWallet(coin: Coins): IWallet {
    switch (coin) {
      case Coins.BTC: {
        return new BtcWallet(AppConfig.wif);
      }
      case Coins.ETH: {
        try {
          const ethCoinModel = new EthWallet(AppConfig.ethKey);
          const keystore = ethCoinModel.recover(AppConfig.ethKey);
          ethCoinModel.login(keystore);
          return ethCoinModel;
        } catch (e) {
          console.log("Cannot initiate ETH wallet.", e);
        }
      }
      case Coins.SNT:
      case Coins.DNT:
      case Coins.CVC:
      case Coins.EOS:
      case Coins.GNT:
      case Coins.SALT:
      case Coins.TRX:
      case Coins.SUB:
      case Coins.OMG:
      case Coins.ANT:
      case Coins.GNO:
      case Coins.BAT:
      case Coins.REP: {
        let token: TOKENS = null;
        switch (coin) {
          case Coins.BAT: {
            token = TOKENS.BAT;
            break;
          }
          case Coins.GNO: {
            token = TOKENS.GNOSIS;
            break;
          }
          case Coins.TRX: {
            token = TOKENS.TRON;
            break;
          }
          case Coins.ANT: {
            token = TOKENS.ARAGON;
            break;
          }
          case Coins.OMG: {
            token = TOKENS.OMISEGO;
            break;
          }
          case Coins.SUB: {
            token = TOKENS.SUBSTRATUM;
            break;
          }
          case Coins.REP: {
            token = TOKENS.AUGUR;
            break;
          }
          case Coins.SALT: {
            token = TOKENS.SALT;
            break;
          }
          case Coins.GNT: {
            token = TOKENS.GOLEM;
            break;
          }
          case Coins.EOS: {
            token = TOKENS.EOS;
            break;
          }
          case Coins.CVC: {
            token = TOKENS.CIVIC;
            break;
          }
          case Coins.DNT: {
            token = TOKENS.DISTRICT0X;
            break;
          }
          case Coins.SNT: {
            token = TOKENS.STATUSNETWORK;
            break;
          }
        }

        const ethCoinModel = new EthTokenWallet(AppConfig.ethKey, token);
        const keystore = ethCoinModel.recover(AppConfig.ethKey);
        ethCoinModel.login(keystore);
        return ethCoinModel;
      }
      default: {
        const ethCoinModel = new EthWallet(AppConfig.ethKey);
        const keystore = ethCoinModel.recover(AppConfig.ethKey);
        ethCoinModel.login(keystore);
        return ethCoinModel;
      }
    }
  }
}
