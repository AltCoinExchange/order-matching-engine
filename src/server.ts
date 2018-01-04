import {NestFactory} from "@nestjs/core";
import {ApplicationModule} from "./modules/app.module";
import * as clicolor from "cli-color";
import {Transport} from "@nestjs/microservices";
import * as fs from "fs";
import * as https from "https";
import {Config} from "./config/config";

async function bootstrap(serveHttps: boolean = true) {

  if (serveHttps) {
    const options = {
      key: fs.readFileSync(Config.SSL_KEY_PATH),
      cert: fs.readFileSync(Config.SSL_CERT_PATH),
    };

    const expressApp = require("express")();
    expressApp.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });

    const httpsServer = https.createServer(options, expressApp);
    const app = await NestFactory.create(ApplicationModule, expressApp);
    await app.init();
    httpsServer.listen(3000);
    console.log(clicolor.yellow("Order Matching Engine Listening on HTTPS port: " + 3000));
  } else {
    const app = await NestFactory.create(ApplicationModule);
    await app.listen(3000);
    console.log(clicolor.yellow("Order Matching Engine Listening on port: " + 3000));
  }
}

bootstrap();
