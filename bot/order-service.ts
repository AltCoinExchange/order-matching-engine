import {ServiceBase} from "./common/ServiceBase";
// import * as Wallet from "../wallet";
// import * as Mongoose from "mongoose";
// import {Collection} from "mongoose";
import {Bot} from "./tradingengine/Bot";

export class OrderService extends ServiceBase {
  // public ethEngine: EthEngine;
  // private collection: Collection;
  private bot: Bot;

  constructor() {
    super();
    this.bot = new Bot();
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
  const orderService = new OrderService();
  await orderService.startService();
}

bootstrap();
