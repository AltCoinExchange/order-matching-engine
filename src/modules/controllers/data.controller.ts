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
  public async getAccountTransactions(@Param() params): Promise<string> {
    await Mongoose.connect("mongodb://127.0.0.1:27017/eth", {useMongoClient: true});
    const coll = Mongoose.connection.collection("eth");

    coll.findOne({ "transaction.from" : params.address});
    return "transaction from address: " + params.address;
  }
}
