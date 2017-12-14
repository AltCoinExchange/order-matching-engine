import {Get, Controller, Param} from "@nestjs/common";
import {EthEngine} from "altcoinio-wallet";

@Controller("data")
export class DataController {
    @Get()
    public root(): string {
        return "...Keep on keeping on...";
    }

    @Get("transactions:address")
    public getAccountTransactions(@Param() params): string {
        return "transaction from address: " + params.address;
    }
}
