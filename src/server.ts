import { NestFactory } from "@nestjs/core";
import { ApplicationModule } from "./modules/app.module";
import * as clicolor from "cli-color";
import {Transport} from "@nestjs/microservices";

async function bootstrap() {
    const app = await NestFactory.create(ApplicationModule);
    await app.listen(3000);
    // tslint:disable-next-line
    console.log(clicolor.yellow("Order Matching Engine Listening on port: " + 3000));
}
bootstrap();
