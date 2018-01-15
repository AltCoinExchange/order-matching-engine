import {Get, Controller, Param, Post} from "@nestjs/common";
import {ParamsHelper} from "../helpers/params.helper";
import {Collections, DbHelper} from "../helpers/db.helper";

@Controller("orders")
export class OrdersController {
  @Get()
  public root(): string {
    return "...Keep on keeping on...";
  }

  @Get("addOrder/:address/:sellCurrency/:sellAmount/:buyCurrency/:buyAmount")
  public async addOder(@Param() params): Promise<any> {
    ParamsHelper.filterParams(params);

    // TODO: Validation of all parameters
    const coll = await DbHelper.GetCollection(Collections.ORDERS);
    params.status = "new";
    params.expiration = new Date(params.expiration);
    params.buyerAddress = "";

    const orderCount = await DbHelper.GetActiveOrdersCount("new", params.address);
    if (orderCount > 0) {
      return { status: "You have an already active order!" };
    }

    const expiration = new Date(Date.now());
    expiration.setHours(expiration.getHours() + 2);

    const record = {} as any;
    record.status = "new"; // Statuses: new, pending, broken
    record.expiration = expiration;
    record.sellerAddress = params.address;
    record.sellValue = parseFloat(params.sellAmount);
    record.currency = params.sellCurrency;
    record.buyValue = parseFloat(params.buyAmount);
    record.buyCurrency = params.buyCurrency;
    record.buyerAddress = "";
    const result = await coll.insertOne(record).then((id) => {
      return coll.findOne({_id: id.insertedId});
    });

    // TODO: Inform WS event
    return {status: result};
  }

  @Get("getActiveOrders")
  public async getActiveOrders(): Promise<any> {
    const coll = await DbHelper.GetCollection(Collections.ORDERS);
    const now = new Date(Date.now());
    const result = await coll.find({status: "new", expiration: { $gte: now }}).toArray();
    return result;
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
