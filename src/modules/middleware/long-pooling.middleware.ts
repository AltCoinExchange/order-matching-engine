import { Middleware, NestMiddleware, ExpressMiddleware } from "@nestjs/common";
import * as clicolor from "cli-color";

@Middleware()
export class LongPoolingMiddleware implements NestMiddleware {
  public resolve(...args: any[]): ExpressMiddleware {
    return (req, res, next) => {
      // tslint:disable-next-line
      console.log(clicolor.yellow("Request log: \r\n"),
        "HEADERS: ", clicolor.yellowBright(JSON.stringify(req.headers)) + "\r\n",
        "PARAMETERS: ", clicolor.yellowBright(JSON.stringify(req.params)) + "\r\n");
      next();
    };
  }
}
