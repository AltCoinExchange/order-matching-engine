import { Middleware, NestMiddleware, ExpressMiddleware } from "@nestjs/common";
import * as clicolor from "cli-color";
import {HttpException} from "@nestjs/core";

@Middleware()
export class IpBlockerMiddleware implements NestMiddleware {
    private timeout: number = 60; // TODO: Get from config
    private ips: Map<string, Date> = new Map<string, Date>(); // TODO: Add permanent ban addresses from db
    private checkDate(req): boolean {
      const elapsedSeconds: number = new Date(new Date(Date.now()).valueOf() -
        this.ips[req.client.remoteAddress].valueOf()).getTime();
      return elapsedSeconds >= new Date(this.timeout * 1000).getTime();
    }
    public resolve(...args: any[]): ExpressMiddleware {
        return (req, res, next) => {
            if (this.ips[req.client.remoteAddress] === undefined) {
              this.ips[req.client.remoteAddress] = new Date(Date.now());
            } else {
                if (!this.checkDate(req)) {
                  console.log(clicolor.red("Blocked: " + req.client.remoteAddress));
                  const err = new HttpException("Blocked by timeout: (default 60 seconds) ", 403);
                  next(err);
                } else {
                  this.ips[req.client.remoteAddress] = new Date(Date.now());
                }
            }
            next();
        };
    }
}
