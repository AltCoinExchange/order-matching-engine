import {Client} from "../abci/Client";

const c = new Client("tcp://127.0.0.1:46658");
c.deliverTx(new Buffer([0x01]), (res) => {
        console.log("DeliverTx result:", res);
        c.close();
    });
c.flush();