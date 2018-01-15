import {Get, Controller, Param, Post} from "@nestjs/common";
import {ParamsHelper} from "../helpers/params.helper";
import {Collections, DbHelper} from "../helpers/db.helper";
import {IOrder} from "../helpers/long-poll.service";

@Controller("orders")
export class OrdersController {
  @Get()
  public root(): string {
    return "...Keep on keeping on...";
  }

  @Get("addOrder/:id/:address/:sellCurrency/:sellAmount/:buyCurrency/:buyAmount")
  public async addOder(@Param() params): Promise<any> {
    ParamsHelper.filterParams(params);

    const order = {
      id: params.id,
      sellCurrency: params.sellCurrency,
      buyCurrency: params.buyCurrency,
      sellAmount: params.sellAmount,
      buyAmount: params.buyAmount,
      sellerAddress: params.address,
    } as IOrder;

    const result = await DbHelper.PutOrder(order);
    // TODO: Inform WS event
    return {status: result};
  }

  @Get("getActiveOrders")
  public async getActiveOrders(): Promise<any> {
    return await DbHelper.GetActiveOrders();
  }

  @Get("participate:/id:/address")
  public async participate(@Param() params): Promise<any> {
    ParamsHelper.filterParams(params);
    const coll = await DbHelper.GetCollection(Collections.ORDERS);
    const now = new Date(Date.now());
    const order = await coll.findOneAndUpdate( { _id: params.id, status: "new", expiration: { $gte: now } },
      { status: "pending", buyerAddress: params.address });
    if (order == null) {
      return { status: "Order expired or already fulfilled" };
    } else {
      return { status: true };
    }
  }
}
