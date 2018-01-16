import * as Mongoose from "mongoose";
import { Collection } from "mongoose";
import {IOrder} from "./long-poll.service";
import {ParamsHelper} from "./params.helper";

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
    const now = new Date(Date.now());
    if (address) {
      return await coll.count({sellerAddress: address.toLowerCase(), status, expiration: {$gte: now}});
    } else {
      return await coll.count({status, expiration: {$gte: now}});
    }
  }

  public static async GetOrderWithId(id: string): Promise<IOrder> {
    const coll = await this.GetCollection(Collections.ORDERS);
    const now = new Date(Date.now());
    if (id) {
      return await coll.findOne({id, expiration: {$gte: now}});
    }
  }

  public static async GetActiveOrders() {
    const coll = await DbHelper.GetCollection(Collections.ORDERS);
    const now = new Date(Date.now());
    return await coll.find({status: "new", expiration: { $gte: now }}).toArray();
  }

  public static async GetMatchedOrders(order: IOrder) {
    const coll = await DbHelper.GetCollection(Collections.ORDERS);
    const now = new Date(Date.now());
    return await coll.find({
      status: "new",
      buyCurrency: order.sellCurrency,
      sellCurrency: order.buyCurrency,
      buyAmount: order.sellAmount,
      sellAmount: order.buyAmount,
      expiration: { $gte: now }}).toArray();
  }

  public static async UpdateOrderStatus(id: string, status: string, buyerAddress: string) {
    const coll = await DbHelper.GetCollection(Collections.ORDERS);
    const now = new Date(Date.now());
    const order = await coll.findOneAndUpdate( { id, status: "new", expiration: { $gte: now } },
      { $set: { status, buyerAddress }});
    if (order == null) {
      return { status: "Order expired or already fulfilled" };
    } else {
      return { status: true };
    }
  }

  public static async PutOrder(params: IOrder): Promise<any> {
    ParamsHelper.filterParams(params);
    const coll = await DbHelper.GetCollection(Collections.ORDERS);
    params.status = "new";
    params.expiration = new Date(params.expiration);
    params.buyerAddress = "";

    const orderCount = await DbHelper.GetActiveOrdersCount("new", params.sellerAddress);
    if (orderCount > 0) {
      return { status: "You have already active order!" };
    }

    const expiration = new Date(Date.now());
    expiration.setHours(expiration.getHours() + 2);

    const record = {} as any;
    record.id = params.id;
    record.status = "new"; // Statuses: new, pending, broken
    record.expiration = expiration;
    record.sellerAddress = params.sellerAddress;
    record.buyerAddress = "";
    record.sellAmount = params.sellAmount;
    record.sellCurrency = params.sellCurrency;
    record.buyAmount = params.buyAmount;
    record.buyCurrency = params.buyCurrency;
    const result = await coll.insertOne(record).then((id) => {
      return coll.findOne({_id: id.insertedId});
    });
    return result;
  }
}
