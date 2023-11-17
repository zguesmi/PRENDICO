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
  getVerificationCode(
    @Res() response: Response,
    @Query('phoneNumber') phoneNumber: number,
  ): Promise<string> {
    return this.appService.getVerificationCode(response, phoneNumber);
  }

  @Get('/disaster')
  getSubmission(
    @Res() response: Response,
    @Query('verificationCode') verificationCode: number,
  ): Promise<string> {
    return this.appService.getSubmission(response, verificationCode);
  }
}
