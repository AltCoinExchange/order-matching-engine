import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  constructor() {

  }

  @Get()
  public root(): string {
    return "...Keep on keeping on...";
  }

  @Get("/test")
  public test(): string {
    return "hahahahah";
  }
}
