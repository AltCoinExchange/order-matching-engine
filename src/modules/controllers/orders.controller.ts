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
    return await coll.insertOne(params);
  }

  @Get("getActiveOrders")
  public async getActiveOrders(@Param() params): Promise<any> {
    ParamsHelper.filterParams(params);
    const coll = await DbHelper.GetCollection(Collections.ORDERS);
    const now = new Date(Date.now());
    return await coll.find({status: "new", expiration: { $gte: now }},
      { buyCurrency: 1, buyAmount: 1, sellCurrency: 1, sellAmount: 1, expiration: 1, status: 1 });
  }
}
