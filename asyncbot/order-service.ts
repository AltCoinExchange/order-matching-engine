import {AsyncBot} from "./tradingengine/AsyncBot";
import {ServiceBase} from '../library/ServiceBase';
// import * as Wallet from "../wallet";
// import * as Mongoose from "mongoose";
// import {Collection} from "mongoose";

export class AsyncOrderService extends ServiceBase {
  // public ethEngine: EthEngine;
  // private collection: Collection;
  private bot: AsyncBot;

  constructor() {
    super();
    this.bot = new AsyncBot();
  }

  // public async createDb(init: boolean = true): Promise<Collection> {
  //   await Mongoose.connect("mongodb://127.0.0.1:27017/eth", {useMongoClient: true});
  //   const coll = Mongoose.connection.collection("orderLog");
  //   if (init) {
  //     // If DB is empty then create indexes
  //     const cnt = await coll.count({});
  //     if (cnt === 0) {
  //       const all = await coll.deleteMany({});
  //       const fromIndex = await coll.createIndex({ "transactions.from": 1 },
  //         { collation: { locale: "en_US", strength: 2 } });
  //       const toIndex = await coll.createIndex({ "transactions.to": 1 },
  //         { collation: { locale: "en_US", strength: 2 } });
  //       const num = await coll.createIndex({number: 1});
  //     }
  //   }
  //   this.collection = coll;
  //   return coll;
  // }

  public async startService() {
    await this.bot.Start();
  }
}

async function bootstrap() {
  // const args = process.argv.slice(2);
  const orderService = new AsyncOrderService();
  await orderService.startService();
}

bootstrap();
