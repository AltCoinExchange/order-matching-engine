import {FeederService} from "./common/FeederService";
import "core-js/es6/reflect";
import "core-js/es7/reflect";
import "reflect-metadata";

export class BtcFeeder extends FeederService {
  constructor(options?) {
    super();
    // TODO Use bitcore-node out of the box service
  }
}

async function bootstrap() {
  const args = process.argv.slice(2);
  const feeder = new BtcFeeder(args[0]);
}

bootstrap();
