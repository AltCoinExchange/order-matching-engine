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
    const from = await coll.findOne({ "transactions.from" : params.address });
    const to = await coll.findOne({ "transactions.to" : params.address });

    if (from !== null) {
      transactions.from = [];
      for (const i in from.transactions) {
        if (from.transactions[i].from === params.address) {
          from.transactions[i].timestamp = from.timestamp;
          from.transactions[i].confirmations = blockNumber - from.transactions[i].blockNumber;
          transactions.from.push(from.transactions[i]);
        }
      }
    }

    if (to !== null) {
      transactions.to = [];
      for (const i in to.transactions) {
        if (to.transactions[i].to === params.address) {
          to.transactions[i].timestamp = to.timestamp;
          to.transactions[i].confirmations = blockNumber - to.transactions[i].blockNumber;
          transactions.from.push(to.transactions[i]);
        }
      }
    }

    return transactions;
  }
}
