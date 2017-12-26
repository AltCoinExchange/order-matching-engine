import {Get, Controller, Param} from "@nestjs/common";
import * as Mongoose from "mongoose";
import {Collection} from "mongoose";

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

    const transactions = {} as any;
    // TODO: Probably this should occur at engine to not pass : into parameters
    params.address = params.address.slice(1);
    const from = await coll.findOne({ "transactions.from" : params.address });
    const to = await coll.findOne({ "transactions.to" : params.address });

    if (from !== null) {
      transactions.from = from.transactions;
    }

    if (to !== null) {
      transactions.to = to.transactions;
    }

    return transactions;
  }
}
