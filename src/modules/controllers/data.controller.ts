import { Get, Controller } from '@nestjs/common';

@Controller('data')
export class DataController {
    @Get()
    root(): string {
        return '...Keep on keeping on...';
    }
}
