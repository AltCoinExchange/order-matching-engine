import {Module} from "@nestjs/common";
import {AppController} from "./app.controller";
import {RatesController} from "./controllers/rates.controller";
import {DataController} from "./controllers/data.controller";

@Module({
  modules: [],
  controllers: [AppController, RatesController, DataController],
  components: [],
})
export class ApplicationModule {}
