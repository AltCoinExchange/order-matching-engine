import {MiddlewaresConsumer, Module, NestModule, RequestMethod} from "@nestjs/common";
import {AppController} from "./app.controller";
import {RatesController} from "./controllers/rates.controller";
import {DataController} from "./controllers/data.controller";
import {LoggerMiddleware} from "./middleware/logger.middleware";
import {OrdersController} from "./controllers/orders.controller";
import {IpBlockerMiddleware} from './middleware/ipblocker.middleware';

@Module({
  modules: [],
  controllers: [AppController, RatesController, DataController, OrdersController],
  components: [],
})

export class ApplicationModule implements NestModule {
  public configure(consumer: MiddlewaresConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes(
      RatesController, DataController, // { path: "/transaction", method: RequestMethod.GET },
    );
    consumer.apply(IpBlockerMiddleware).forRoutes(
      DataController, // { path: "/transaction", method: RequestMethod.GET },
    );
  }
}
