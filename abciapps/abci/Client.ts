import {Connection} from './Connection';

const net = require("net");
const types = require("./types");

export class Client {
  private error = undefined;
  private addr: string;
  private reqResQ = [];
  private reqResQSendPtr = 0;
  private conn = null;
  private sending = false;

  // TODO: Handle auto-reconnect & re-sending requests.
  constructor(addr) {
    this.addr = addr;
    this._connect();
  }

  /**
   * Parse address
   * @param addr
   * @returns {any}
   * @constructor
   */
  public ParseAddr(addr) {
    if (addr.startsWith("tcp://")) {
      const hostPort = addr.substr(6).split(":");
      return {host: hostPort[0], port: hostPort[1]};
    }
    if (addr.startsWith("unix://")) {
      return {path: addr.substr(7)};
    }
  }

  /**
   * Connect to the node
   * @private
   */
  public _connect() {
    const addrObj = this.ParseAddr(this.addr);
    const socket = net.connect(addrObj, () => {
      this.conn = new Connection(socket, (resBytes, cb) => {
        this.onResponse(resBytes, cb);
      });
      this.wakeSender();
    });
  }

  /**
   * Event on response
   * @param resBytes
   * @param cb
   */
  public onResponse(resBytes, cb) {
    const res = types.Response.decode(resBytes);
    if (res.value === "exception") {
      this.setError(res[0]);
      return;
    }
    if (this.reqResQ.length === 0) {
      this.setError("Unexpected response: " + resBytes.toString("hex"));
      return;
    }
    const reqRes = this.reqResQ[0];
    if (res.value !== reqRes.req.value) {
      this.setError("Unexpected response type: " + resBytes.toString("hex"));
      return;
    }
    if (!!reqRes.cb) {
      reqRes.cb(res);
    }
    // TODO: we'll want to do something more intelligent
    // in the future to handle reconnects; e.g. resend requests.
    this.reqResQ.shift();
    this.reqResQSendPtr--;
    cb();
  }

  /**
   * Set error
   * @param error
   */
  public setError(error) {
    if (!this.error) {
      this.error = error;
    }
  }

  /**
   * Queue request
   * @param type
   * @param reqObj
   * @param cb
   */
  public queueRequest(type, reqObj, cb) {
    if (typeof type === "undefined") {
      throw new Error("queueRequest cannot handle undefined types");
    }
    const reqObjWrapper = {};
    reqObjWrapper[type] = reqObj;
    const req = new types.Request(reqObjWrapper);
    const reqRes = {req, cb};
    console.log("!!!", req);
    this.reqResQ.push(reqRes);
    this.wakeSender();
  }

  /**
   * Wake sender
   */
  public wakeSender() {
    if (!this.conn) {
      // wakeSender gets called again upon connection est.
      return;
    }
    if (!this.sending) {
      this.sending = true;
      setTimeout(
        () => {
          this.sendRequest();
        },
        0
      );
    }
  }

  /**
   * Send request
   */
  public sendRequest() {
    // Get next request to send
    const nextReqRes = this.reqResQ[this.reqResQSendPtr];
    if (!nextReqRes) {
      // NOTE: this case is duplicated at the end of this function
      this.sending = false;
      return; // Nothing to send, we're done!
    }
    // Send request
    const req = nextReqRes.req;
    this.conn.writeMessage(req);
    this.reqResQSendPtr++;
    // Also flush maybe
    if (req.value === "flush") {
      this.conn.flush();
    }
    // If we have more messages to send...
    if (this.reqResQ.length > this.reqResQSendPtr) {
      setTimeout(
        () => {
          this.sendRequest();
        },
        0
      ); // TODO: benchmark this; batch it if slow.
    } else {
      // NOTE: this case is duplicated at the start of this function
      this.sending = false;
      return; // Nothing to send, we're done!
    }
  }

  /**
   * Close connection
   */
  public close() {
    this.conn.close();
  }

  // ABCI function requests

  public flush(cb?) {
    const reqObj = {};
    this.queueRequest("flush", reqObj, cb);
  }

  public info(cb) {
    const reqObj = {};
    this.queueRequest("info", reqObj, cb);
  }

  public setOption(key, value, cb) {
    const reqObj = {key, value};
    this.queueRequest("set_option", reqObj, cb);
  }

  public deliverTx(txBytes, cb) {
    const reqObj = {tx: txBytes};
    this.queueRequest("deliver_tx", reqObj, cb);
  }

  public checkTx(txBytes, cb) {
    const reqObj = {tx: txBytes};
    this.queueRequest("check_tx", reqObj, cb);
  }

  public commit(cb) {
    const reqObj = {};
    this.queueRequest("commit", reqObj, cb);
  }

  public query(data, path, height, prove, cb) {
    const reqObj = {data, path, height, prove};
    this.queueRequest("query", reqObj, cb);
  }

  public initChain(cb) {
    const reqObj = {};
    this.queueRequest("init_chain", reqObj, cb);
  }

  public beginBlock(cb) {
    const reqObj = {};
    this.queueRequest("begin_block", reqObj, cb);
  }

  public endBlock(cb) {
    const reqObj = {};
    this.queueRequest("end_block", reqObj, cb);
  }
}
