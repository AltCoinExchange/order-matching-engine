import { Column } from "typeorm";

export class Signature {
  public messageHash: string;

  public v: string;

  public r: string;

  public s: string;

  public signature: string;
}
