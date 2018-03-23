import {CodeType} from './ABCIEnums';

const util = require("util");
import {Server} from './Server';

export interface IABCIResponse {
  code: any;
  log?: string;
  data?: any;
}

export interface IABCIInternalResponse {
  cb: any;
  status: ABCI_STATUS;
}

export enum ABCI_STATUS {
  OK = 1,
  ERROR = 2
}

export class MetaData {
  private static metaData = new Map<string, any>();
  public static Meta(): Map<string, any> {
    return this.metaData;
  }
}

export const ContractData = (target: any, key: string) => {
  MetaData.Meta().set(key, "test");
  // return (target: any, prop: string, descriptor: PropertyDescriptor) => {
  //   Reflect.defineMetadata("contractData", "lol", target, prop);
  //   // Reflect.defineMetadata("abiParams", rootData, target, functionName);
  // };
};

export class ABCIBase {
  protected serial: boolean = true;
  protected hashCount: number = 0;
  @ContractData
  protected txCount: number = 0;

  public Start() {
    console.log("ABCI Application started at the port 46658");
    const appServer = new Server(this);
    appServer.Start(46658);
  }

  /**
   * Check transaction
   * @param request
   * @param callback
   * @returns {any}
   */
  public checkTx(request, callback: (data: IABCIResponse) => any) {
    const nonce = this.checkNonce(request.check_tx, callback);
    if (nonce.status === ABCI_STATUS.ERROR) {
      return nonce.cb;
    }
    return callback({code: CodeType.OK});
  }

  /**
   * Deliver transaction
   * @param request
   * @param callback
   * @returns {any}
   */
  public deliverTx(request, callback: (data: IABCIResponse) => any) {
    const nonce = this.checkNonce(request.deliver_tx, callback);
    if (nonce.status === ABCI_STATUS.ERROR) {
      return callback(nonce.cb);
    }
    this.txCount += 1;
    return callback(nonce.cb);
  }

  /**
   * ABCI Method info
   * @returns {any}
   */
  public info(request, callback) {
    return callback({
      data: util.format("hashes:%d, txs:%d", this.hashCount, this.txCount),
    });
  }

  /**
   * Check if nonce is valid
   * @param request
   * @param {(data: IABCIResponse) => any} callback
   * @returns {IABCIInternalResponse}
   */
  protected checkNonce(request, callback: (data: IABCIResponse) => any): IABCIInternalResponse {
    console.log(request);
    let txBytes = request.tx.toBuffer();
    if (txBytes.length >= 2 && txBytes.slice(0, 2) === "0x") {
      const hexString = txBytes.toString("" +
        "ascii", 2);
      const hexBytes = new Buffer(hexString, "hex");
      txBytes = hexBytes;
    }

    const txValue = txBytes.readUIntBE(0, txBytes.length);
    if (txValue < this.txCount) {
      return { cb: {code: CodeType.BadNonce, log: `Nonce is too low. Got ${txValue}, expected >= ${this.txCount}`}, status: ABCI_STATUS.ERROR };
    }

    return { cb: {code: CodeType.OK}, status: ABCI_STATUS.OK };
  }
}
