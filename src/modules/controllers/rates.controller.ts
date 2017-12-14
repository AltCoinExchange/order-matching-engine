import { Get, Controller } from "@nestjs/common";

@Controller("rates")
export class RatesController {
    @Get()
    public root(): string {
        return "...Keep on keeping on...";
    }
    @Get("rate")
    public getRate(): string {
        return "{\"ETH\": 0.01}";
    }
}
