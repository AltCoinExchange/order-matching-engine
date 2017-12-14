import { Get, Controller } from '@nestjs/common';

@Controller('rates')
export class RatesController {
    @Get()
    root(): string {
        return '...Keep on keeping on...';
    }
    @Get('rate')
    getRate(): string {
        return '{"ETH": 0.01}';
    }
}
