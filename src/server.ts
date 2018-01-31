import { NestFactory } from "@nestjs/core";
import * as clicolor from "cli-color";
import * as fs from "fs";
import * as https from "https";
import { Config } from "./config/config";
import { ApplicationModule } from "./modules/app.module";
import { LongPollService } from "./modules/helpers/long-poll.service";
import { WsAdapter } from "./modules/adapters/websocketadapter";

declare var process: {
  env: {
    NODE_ENV: string;
  };
};

async function bootstrap(serveHttps: boolean = false) {

  if (serveHttps) {
    const options = {
      key: fs.readFileSync(Config.SSL_KEY_PATH),
      cert: fs.readFileSync(Config.SSL_CERT_PATH),
    };

    const expressApp = require("express")();
    // expressApp.use((req, res, next) => {
    //   res.header("Access-Control-Allow-Origin", "*");
    //   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //   next();
    // });

    const httpsServer = https.createServer(options, expressApp);
    const app = await NestFactory.create(ApplicationModule, expressApp);
    await app.init();
    httpsServer.listen(3000);
    console.log(clicolor.yellow("Order Matching Engine Listening on HTTPS port: " + 3000));
  } else {
    const expressApp = require("express")();
    expressApp.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });

    const app = await NestFactory.create(ApplicationModule, expressApp);
    app.useWebSocketAdapter(new WsAdapter(3002));

    await LongPollService.getInstance().setExpressInstance(expressApp);

    await app.listen(3000);
    console.log(clicolor.yellow("Order Matching Engine Listening on port: " + 3000));
  }
}

bootstrap();
