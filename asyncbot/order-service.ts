import {AsyncBot} from "./tradingengine/AsyncBot";
import {ServiceBase} from '../library/ServiceBase';

export class AsyncOrderService extends ServiceBase {
  private bot: AsyncBot;

  constructor() {
    super();
    this.bot = new AsyncBot();
  }

  public async startService() {
    await this.bot.Start();
  }
}

async function bootstrap() {
  const orderService = new AsyncOrderService();
  await orderService.startService();
}

bootstrap();
