/* tslint: disable */
export abstract class Reflect {
    public static getMetadata(metadataKey: any, target: Object, targetKey:string | symbol): any;
    public static getOwnMetadata(metadataKey: any, target: Object, targetKey: string | symbol): any;
    public static getOwnMetadata(metadataKey: any, target: Object): any;
    public static defineMetadata(metadataKey: any, metadataValue: any, target: Object, targetKey?: string | symbol): void;
}