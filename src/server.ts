import { NestFactory } from "@nestjs/core";
import { ApplicationModule } from "./modules/app.module";
import * as clicolor from "cli-color";
import {Transport} from "@nestjs/microservices";

async function bootstrap() {
    const app = await NestFactory.create(ApplicationModule);
    await app.listen(3000);
    // tslint:disable-next-line
    console.log(clicolor.yellow("Order Matching Engine Listening on port: " + 3000));

    // const feedApp = await NestFactory.createMicroservice(ApplicationModule, {
    //     transport: Transport.REDIS,
    //     url: "redis://localhost:6379",
    // });
    //
    // feedApp.listen(() => {
    //
    //     const a = this.pub;
    //     // tslint:disable-next-line
    //     console.log(clicolor.red("Received info from Redis"), a);
    //
    // });
    //
    // // tslint:disable-next-line
    // console.log(clicolor.yellow("Redis block information feeder started to listen messages at: "));
}
bootstrap();
