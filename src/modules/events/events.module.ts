import { Module } from "@nestjs/common";
import { EventsGateway } from "./events.gateway";
import {OrdersGateway} from './orders.gateway';

@Module({
  components: [EventsGateway, OrdersGateway],
})
export class EventsModule {}
