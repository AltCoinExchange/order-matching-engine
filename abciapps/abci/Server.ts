const net = require("net");
const types = require("./types");
import {Connection} from "./Connection";

// Wrap a function to only be called once.
const respondOnce = (f) => {
  let ran = false;
  return function() {
    if (ran) {
      console.log("Error: response was already written");
      console.log("arguments", arguments);
      return;
    } else {
      ran = true;
    }
    return f.apply(this, arguments);
  };
};

export class Server {
  private app: any;
  private server: any;

  constructor(app) {
    this.app = app;
    // create a server by providing callback for
    // accepting new connection and callbacks for
    // connection events ('data', 'end', etc.)
    this.createServer();
  }

  public Start(port: number) {
    this.server.listen(port);
  }

  public createServer() {
    const app = this.app;

    // Define the socket handler
    this.server = net.createServer((socket) => {
      socket.name = socket.remoteAddress + ":" + socket.remotePort;
      console.log("new connection from", socket.name);

      const conn = new Connection(socket, (reqBytes, cb) => {
        const req = types.Request.decode(reqBytes);
        const msgType = req.value;

        // Special messages.
        // NOTE: msgs are length prefixed
        if (msgType === "flush") {
          const res = new types.Response({
            flush: new types.ResponseFlush(),
          });
          conn.writeMessage(res);
          conn.flush();
          return cb();
        } else if (msgType === "echo") {
          const res = new types.Response({
            echo: new types.ResponseEcho({message: req.message})
          });
          conn.writeMessage(res);
          return cb();
        }

        // Make callback for apps to pass result.
        const resCb = respondOnce((resObj) => {
          // Convert strings to utf8
          if (typeof resObj.data === "string") {
            resObj.data = new Buffer(resObj.data);
          }
          // Response type is always the same as req type
          const resMessageType = types.resMessageLookup[msgType];
          const res = new types.Response();
          const resValue = new resMessageType(resObj);
          res.set(msgType, resValue);
          conn.writeMessage(res);
          cb(); // Tells Connection that we're done responding.
        });

        // Call app function
        const reqMethod = types.reqMethodLookup[msgType];
        if (!reqMethod) {
          throw new Error("Unexpected request type " + msgType);
        }
        if (!app[reqMethod]) {
          console.log("Method not implemented: " + reqMethod);
          resCb();
        } else {
          const reqValue = req[msgType];
          const res = app[reqMethod].call(app, req, resCb);
          if (res !== undefined) {
            console.log("Message handler shouldn't return anything!");
          }
        }
      });
    });
  }
}
