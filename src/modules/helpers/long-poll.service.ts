import * as expressLP from "express-longpoll";
import "rxjs/add/operator/delay";
import { Subject } from "rxjs/Subject";

const uuidv4 = require("uuid/v4");

export class LongPollService {
  private static instance;
  private order: Subject<IOrder> = new Subject<IOrder>();
  private lp;

  constructor() {
    if (LongPollService.instance) {
      throw new Error("Error - use Singleton.getInstance()");
    }

    let pairs = [];
    this.order.delay(1000).subscribe((order: IOrder) => {
      console.log("RECEIVING ORDER", order);
      pairs.push(order.id);
      if (pairs && pairs.length >= 2) {
        const orderId = uuidv4().replace(/-/g, "");

        pairs.forEach((pair, index) => {
          this.lp.publishToId("/order/:id/:from/:to/:amount/:address", pair, {
            order_id: orderId,
            side: index % 2 === 0 ? "a" : "b"
          });
        });

        pairs = [];
      }
    });
  }

  public static getInstance(): LongPollService {
    LongPollService.instance = LongPollService.instance || new LongPollService();
    return LongPollService.instance;
  }

  public setExpressInstance(expressApp) {
    this.lp = expressLP(expressApp);
    this.lp.create("/order/:id/:from/:to/:amount/:address", (req, res, next) => {
      req.id = req.params.id;
      const order = {
        id: req.params.id,
        from: req.params.from,
        to: req.params.to,
        amount: req.params.amount,
        address: req.params.address,
      } as IOrder;
      this.order.next(order); /// i jos svi ostali podatci coin, value etc
      console.log("CREATING ORDER", req.id);
      next();
    });
  }
}

export interface IOrder {
  id: string;
  from: string;
  to: string;
  amount: number;
  address: string;
}
