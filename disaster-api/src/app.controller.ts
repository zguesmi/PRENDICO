import { Controller, Get, Ip, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/disaster')
  getDisaster(
    @Ip() _ip,
    @Param('userSessionId') userSessionId: string,
  ): Promise<string> {
    return this.appService.getDisaster(_ip, userSessionId);
  }
}
