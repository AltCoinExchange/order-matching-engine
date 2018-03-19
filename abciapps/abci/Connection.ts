const wire = require("js-wire");

const maxWriteBufferLength = 4096; // Any more and flush

export class Connection {
  private socket = undefined;
  private recvBuf = new Buffer(0);
  private sendBuf = new Buffer(0);
  private msgCb = undefined;
  private waitingResult = false;

  constructor(socket, msgCb) {
    this.socket = socket;
    this.msgCb = msgCb;
    const conn = this;

    // Handle ABCI requests.
    socket.on('data', (data) => {
      conn.appendData(data);
    });
    socket.on('end', () => {
      console.log("connection ended");
    });
  }

  public writeMessage(msg) {
    const msgBytes = msg.encode().toBuffer();
    const msgLength = wire.uvarintSize(msgBytes.length);
    const buf = new Buffer(1 + msgLength + msgBytes.length);
    const w = new wire.Writer(buf);
    w.writeByteArray(msgBytes); // TODO technically should be writeconstint
    this.sendBuf = Buffer.concat([this.sendBuf, w.getBuffer()]);
    if (this.sendBuf.length >= maxWriteBufferLength) {
      this.flush();
    }
  }

  public flush() {
    const n = this.socket.write(this.sendBuf);
    this.sendBuf = new Buffer(0);
  }

  public close() {
    this.socket.destroy();
  }

  public appendData(bytes) {
    const conn = this;
    if (bytes.length > 0) {
      this.recvBuf = Buffer.concat([this.recvBuf, new Buffer(bytes)]);
    }
    if (this.waitingResult) {
      return;
    }
    const r = new wire.Reader(this.recvBuf);
    let msgBytes;
    try {
      msgBytes = r.readByteArray();
    } catch (e) {
      return;
    }
    this.recvBuf = r.buf.slice(r.offset);
    this.waitingResult = true;
    this.socket.pause();
    try {
      this.msgCb(msgBytes, () => {
        // This gets called after msg handler is finished with response.
        conn.waitingResult = false;
        conn.socket.resume();
        if (conn.recvBuf.length > 0) {
          conn.appendData("");
        }
      });
    } catch (e) {
      if (e.stack) {
        console.log("FATAL ERROR STACK: ", e.stack);
      }
      console.log("FATAL ERROR: ", e);
    }
  }
}
