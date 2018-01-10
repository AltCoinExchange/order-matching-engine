import * as expressLP from "express-longpoll";
import "rxjs/add/operator/delay";
import { Subject } from "rxjs/Subject";

const uuidv4 = require("uuid/v4");

export class LongPollService {
  private static instance;
  private order: Subject<any> = new Subject<any>();
  private lp;

  constructor() {
    if (LongPollService.instance) {
      throw new Error("Error - use Singleton.getInstance()");
    }

    let pairs = [];
    this.order.delay(1000).subscribe((resp) => {
      console.log("RECEIVING ORDER", resp);
      pairs.push(resp);
      if (pairs && pairs.length >= 2) {
        const orderId = uuidv4().replace(/-/g, "");

        pairs.forEach((pair, index) => {
          this.lp.publishToId("/order/:id", pair, {
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
    this.lp.create("/order/:id", (req, res, next) => {
      req.id = req.params.id;
      this.order.next(req.id); /// i jos svi ostali podatci coin, value etc
      console.log("CREATING ORDER", req.id);
      next();
    });
  }
}
