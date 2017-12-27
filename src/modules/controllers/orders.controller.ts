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
    return await coll.insertOne(params);
  }
}
