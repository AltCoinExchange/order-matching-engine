import { Controller, Get } from "@nestjs/common";
import * as Mongoose from "mongoose";
import { Transactional } from "../db/transactional";

@Controller("rates")
export class RatesController {
  @Get()
  public root(): string {
    return "...Keep on keeping on...";
  }

  @Get("rate")
  @Transactional()
  public async getRate(): Promise<any> {
    const coll = Mongoose.connection.collection("eth");
    const cnt = await coll.count({});
    return {
      ETH: cnt,
    };
  }
}
