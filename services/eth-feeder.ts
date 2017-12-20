import {FeederService} from "./common/FeederService";
import {EthEngine} from "../wallet/src/eth";
import {EthConfiguration} from "./config/eth";
import "core-js/es6/reflect";
import "core-js/es7/reflect";
import "reflect-metadata";

// declare abstract class Reflect {
//     public static getMetadata(metadataKey: any, target: Object, targetKey: string | symbol): any;
//     public static getOwnMetadata(metadataKey: any, target: Object, targetKey: string | symbol): any;
//     public static getOwnMetadata(metadataKey: any, target: Object): any;
//     public static defineMetadata(metadataKey: any, metadataValue: any,
//                                  target: Object, targetKey?: string | symbol): void;
// }

export class EthFeeder extends FeederService {
    public ethEngine: EthEngine;
    constructor() {
        super();
        this.ethEngine = new EthEngine(null, EthConfiguration.hosts[0], null);
        this.startService();
    }

    public async startService() {
        const result = await this.ethEngine.scanBlockRange();
        console.log(result);
    }
}

async function bootstrap() {
    const feeder = new EthFeeder();
}

bootstrap();
