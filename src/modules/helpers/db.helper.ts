import * as Mongoose from "mongoose";
import {Collection} from "mongoose";

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
    return Mongoose.connection.collection(Collections[collectionName].toLowerCase());
  }
}
