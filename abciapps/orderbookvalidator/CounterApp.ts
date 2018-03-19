const util = require("util");
const abci = require("js-abci");
import {ABCIBase} from '../abci/ABCIBase';

export class CounterApp extends ABCIBase {

  /**
   * Set option
   * @param request
   * @param callback
   * @returns {any}
   */
  public setOption(request, callback) {
    if (request.set_option.key === "serial") {
      if (request.set_option.value === "on") {
        this.serial = true;
        return callback({ log: "ok" });
      } else if (request.set_option.value === "off") {
        this.serial = false;
        return callback({ log: "ok" });
      } else {
        return callback({ log: "Unexpected value " + request.set_option.value });
      }
    }
    return callback({ log: "Unexpected key " + request.set_option.key });
  }

  /**
   * Commit transaction
   * @param request
   * @param callback
   * @returns {any}
   */
  public commit(request, callback) {
    this.hashCount += 1;
    if (this.txCount === 0) {
      return callback({log: "Zero tx count; hash is empty"});
    }
    const buf = new Buffer(8);
    buf.writeIntBE(this.txCount, 0, 8);
    return callback({data: buf});
  }
}
