import * as Mongoose from "mongoose";
import { Collection } from "mongoose";

export enum Collections {
  ORDERS = 1,
}

export class DbHelper {
  /**
   * Database name
   * @type {string}
   */
  public static dbName: string = "orders";

  /**
   * Get collection from database
   * @param {string} collectionName
   * @returns {Promise<Collection>}
   * @constructor
   */
  public static async GetCollection(collectionName: Collections): Promise<Collection> {
    await Mongoose.connect("mongodb://127.0.0.1:27017/" + this.dbName, {useMongoClient: true});

    const coll = Mongoose.connection.collection(Collections[collectionName].toLowerCase());
    // If collection is empty then create indexes
    const cnt = await coll.count({});

    if (collectionName === Collections.ORDERS) {
      if (cnt === 0) {
        const all = await coll.deleteMany({});
        const status = await coll.createIndex({status: 1},
          {collation: {locale: "en_US", strength: 2}} as any);
        const sellerAddress = await coll.createIndex({sellerAddress: 1},
          {collation: {locale: "en_US", strength: 2}} as any);
        const buyerAddress = await coll.createIndex({buyerAddress: 1},
          {collation: {locale: "en_US", strength: 2}} as any);
        const exipration = await coll.createIndex({expiration: 1});
      }
    }
    return coll;
  }

  public static async GetActiveOrdersCount(status: string, address?: string): Promise<number> {
    const coll = await this.GetCollection(Collections.ORDERS);
    if (address) {
      const now = new Date(Date.now());
      return await coll.count({sellerAddress: address.toLowerCase(), status, expiration: {$gte: now}});
        // { _id: 1, buyCurrency: 1, buyAmount: 1, sellCurrency: 1, sellAmount: 1, expiration: 1, status: 1 });
    }
  }
}
