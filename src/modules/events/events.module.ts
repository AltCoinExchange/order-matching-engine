import { Module } from "@nestjs/common";
import {OrdersGateway} from "./orders.gateway";

@Module({
  components: [OrdersGateway],
})
export class EventsModule {}
