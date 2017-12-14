import { Get, Controller } from '@nestjs/common';

@Controller()
export class AppController {
	@Get()
	root(): string {
    return '...Keep on keeping on...';
  }
}
