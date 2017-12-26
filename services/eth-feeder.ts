import {FeederService} from "./common/FeederService";
import {EthEngine} from "../wallet/src/eth";
import {EthConfiguration} from "./config/eth";
import "core-js/es6/reflect";
import "core-js/es7/reflect";
import "reflect-metadata";
import * as Mongoose from "mongoose";
import {Collection} from "mongoose";

export class EthFeeder extends FeederService {
  public ethEngine: EthEngine;
  private currentBlockNumber: number = 0;
  private lastBlockNumber: number = 0;
  private collection: Collection;

  constructor(blockNum?) {
    super();
    this.ethEngine = new EthEngine(null, EthConfiguration.hosts[0], null);
    this.startService(blockNum);
  }

  public async WatchForChanges() {
    const that = this;
    return await new Promise(async (resolve, reject) => {
      setInterval(async (e) => {
        const blockNumber =  await this.ethEngine.getBlockNumber();
        if (blockNumber !== that.currentBlockNumber) {
            console.log("Found incoming block");
            await that.storeBlock(that.collection, that.currentBlockNumber + 1, blockNumber);
        }
      }, 5 * 1000);
    });
  }

  public async createDb(init: boolean = true): Promise<Collection> {
    const that = this;
    await Mongoose.connect("mongodb://127.0.0.1:27017/eth", {useMongoClient: true});
    const coll = Mongoose.connection.collection("eth");
    if (init) {
      // If DB is empty then create indexes
      const cnt = await coll.count({});
      if (cnt === 0) {
        const all = await coll.deleteMany({});
        const index = await coll.createIndex({"transaction.from": 1, "transaction.to": 1, "number": 1});
      } else {
        const block = await this.getLastBlock(coll);
        console.log("Last block:", block.number);
        this.lastBlockNumber = block.number;
      }
    }
    this.collection = coll;
    return coll;
  }

  public async storeBlock(coll: Collection, startingBlock, stoppingBlock) {
    await this.ethEngine.scanBlockRange(startingBlock, stoppingBlock, async (b) => {
      if (b.transactions.length > 0) {
        // console.log(b);
        try {
          await coll.insertOne(b);
        } catch (e) {
          console.log(e);
        }
      }
    });
  }

  public async getLastBlock(coll: Collection): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const lastBlock = await coll.find().sort({number: -1}).limit(1);
      lastBlock.next((err, block) => {
        resolve(block);
      });
    });
  }

  public async startService(blockNum?) {
    const blockNumber = await this.ethEngine.getBlockNumber();
    this.currentBlockNumber = blockNumber;
    const coll = await this.createDb();
    let startingBlock: number = blockNum > 0 ? parseInt(blockNum) : 0;
    if (startingBlock === 0) {
      if (this.lastBlockNumber === 0) {
        startingBlock = 1;
      } else {
        startingBlock = this.lastBlockNumber;
      }
    }

    await this.storeBlock(coll, startingBlock, blockNumber);
    await this.WatchForChanges();
  }
}

async function bootstrap() {
  const args = process.argv.slice(2);
  const feeder = new EthFeeder(args[0]);
}

bootstrap();
