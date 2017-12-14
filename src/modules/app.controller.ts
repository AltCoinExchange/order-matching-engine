import { Get, Controller } from "@nestjs/common";

@Controller()
export class AppController {
    @Get()
    public root(): string {
    return "...Keep on keeping on...";
  }
}
