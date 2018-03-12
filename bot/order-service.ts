import {Bot} from "./tradingengine/Bot";
import {ServiceBase} from '../library/ServiceBase';

export class OrderService extends ServiceBase {
  // public ethEngine: EthEngine;
  // private collection: Collection;
  private bot: Bot;

  constructor() {
    super();
    this.bot = new Bot();
  }

  public async startService() {
    await this.bot.Start();
  }
}

async function bootstrap() {
  // const args = process.argv.slice(2);
  const orderService = new OrderService();
  await orderService.startService();
}

bootstrap();
