import { Controller, Get, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/verificationcode')
  getVerificationCode(
    @Res() response: Response,
    @Query('phoneNumber') phoneNumber: string,
  ): Promise<string> {
    return this.appService.getVerificationCode(response, phoneNumber);
  }

  @Get('/verifycode')
  verifyCode(
    @Res() response: Response,
    @Query('phoneNumber') phoneNumber: string,
    @Query('verificationCode') verificationCode: string,
    @Query('userSessionId') userSessionId: number,
  ): Promise<string> {
    return this.appService.verifyCode(
      response,
      phoneNumber,
      verificationCode,
      userSessionId,
    );
  }
}
