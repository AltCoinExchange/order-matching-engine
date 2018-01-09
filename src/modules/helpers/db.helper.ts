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
        const address = await coll.createIndex({address: 1},
          {collation: {locale: "en_US", strength: 2}} as any);
        const exipration = await coll.createIndex({expiration: 1});
      }
    }
    return coll;
  }
}
