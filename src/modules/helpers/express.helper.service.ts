import * as expressLP from "express-longpoll";

const uuidv4 = require("uuid/v4");

export class LongPollService {
  private static instance;

  constructor() {
    if (LongPollService.instance) {
      throw new Error("Error - use Singleton.getInstance()");
    }
  }

  public static getInstance(): LongPollService {
    LongPollService.instance = LongPollService.instance || new LongPollService();
    return LongPollService.instance;
  }

  public setExpressInstance(expressApp) {
    const lp = expressLP(expressApp);
    let pairs = [];
    lp.create("/order/:id", (req, res, next) => {
      pairs.push(req.params.id);
      req.id = req.params.id;
      next();
    });

    setInterval(() => {
      console.log(pairs);
      if (pairs && pairs.length >= 2) {
        const orderId = uuidv4().replace(/-/g, "");
        lp.publishToId("/order/:id", pairs[0], {
          order_id: orderId,
          side: "a"
        });
        lp.publishToId("/order/:id", pairs[1], {
          order_id: orderId,
          side: "b"
        });
        pairs = [];
      }
    }, 5000);
  }
}
