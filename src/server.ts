import { NestFactory } from "@nestjs/core";
import { ApplicationModule } from "./modules/app.module";
import * as clicolor from "cli-color";

async function bootstrap() {
    const app = await NestFactory.create(ApplicationModule);
    // tslint:disable-next-line
    console.log(clicolor.yellow("Order Matching Engine Listening on port: " + 3000));
    await app.listen(3000);
}
bootstrap();
