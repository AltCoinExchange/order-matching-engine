import {Get, Controller, Param} from "@nestjs/common";
import * as Mongoose from "mongoose";
import {Collection} from "mongoose";
import {EthConfiguration} from "../../../services/config/eth";
import * as Web3 from "web3/src";

@Controller("data")
export class DataController {
  @Get()
  public root(): string {
    return "...Keep on keeping on...";
  }

  @Get("transactions:address")
  public async getAccountTransactions(@Param() params): Promise<any> {
    await Mongoose.connect("mongodb://127.0.0.1:27017/eth", {useMongoClient: true});
    const coll = Mongoose.connection.collection("eth");

    const wsProvider = new Web3.providers.WebsocketProvider(EthConfiguration.hosts[0].wshost);
    const web3 = new Web3(wsProvider);
    const blockNumber = await web3.eth.getBlockNumber();

    const transactions = {} as any;
    // TODO: Probably this should occur at engine to not pass : into parameters
    params.address = params.address.slice(1).toLowerCase();
    const from = await coll.find({ "transactions.from" : params.address }).toArray();
    const to = await coll.find({ "transactions.to" : params.address }).toArray();

    if (from !== null) {
      transactions.from = [];
      for (const t in from) {
        for (const i in from[t].transactions) {
          if (from[t].transactions[i].from === params.address) {
            from[t].transactions[i].timestamp = from[t].timestamp;
            from[t].transactions[i].confirmations = blockNumber - from[t].transactions[i].blockNumber;
            transactions.from.push(from[t].transactions[i]);
          }
        }
      }
    }

    if (to !== null) {
      transactions.to = [];
      for (const t in to) {
        for (const i in to[t].transactions) {
          if (to[t].transactions[i].to === params.address) {
            to[t].transactions[i].timestamp = to[t].timestamp;
            to[t].transactions[i].confirmations = blockNumber - to[t].transactions[i].blockNumber;
            transactions.from.push(to[t].transactions[i]);
          }
        }
      }
    }

    await coll.conn.close();
    return transactions;
  }
}
