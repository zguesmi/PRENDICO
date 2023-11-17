import { Controller, Get, Ip, Query, Res } from '@nestjs/common';
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
    @Res() response: Response,
    @Ip() _ip,
    @Query('userSessionId') userSessionId: number,
  ): Promise<string> {
    return this.appService.getDisaster(response, _ip, userSessionId);
  }
}
