import {Get, Controller, Param, Post} from "@nestjs/common";
import {ParamsHelper} from "../helpers/params.helper";
import {Collections, DbHelper} from "../helpers/db.helper";

@Controller("orders")
export class OrdersController {
  @Get()
  public root(): string {
    return "...Keep on keeping on...";
  }

  @Get("addOrder/:address/:buyCurrency/:buyAmount/:sellCurrency/:sellAmount/:expiration")
  public async addOder(@Param() params): Promise<any> {
    ParamsHelper.filterParams(params);
    const coll = await DbHelper.GetCollection(Collections.ORDERS);
    params.status = "new";
    params.expiration = new Date(params.expiration);
    params.buyerAddress = "";
    return await coll.insertOne(params);
  }

  @Get("getActiveOrders")
  public async getActiveOrders(): Promise<any> {
    const coll = await DbHelper.GetCollection(Collections.ORDERS);
    const now = new Date(Date.now());
    return await coll.find({status: "new", expiration: { $gte: now }},
      { _id: 1, buyCurrency: 1, buyAmount: 1, sellCurrency: 1, sellAmount: 1, expiration: 1, status: 1 });
  }

  @Get("buyOrder:/id:/address")
  public async buyOrder(@Param() params): Promise<any> {
    ParamsHelper.filterParams(params);
    const coll = await DbHelper.GetCollection(Collections.ORDERS);
    const now = new Date(Date.now());
    const order = await coll.findOneAndUpdate( { _id: params.id, status: "new", expiration: { $gte: now } },
      { status: "in_progress", buyerAddress: params.address });
    if (order == null) {
      return { status: "Order expired or already fulfilled" };
    } else {
      return { status: true };
    }
  }
}
