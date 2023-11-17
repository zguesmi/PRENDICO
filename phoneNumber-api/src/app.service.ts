import { Injectable } from '@nestjs/common';
import Client from 'mina-signer';

const client = new Client({ network: 'testnet' });
const COMPENSATION = 1; // Send 1 MINA on disaster
const DISASTER_LEVEL = 'Orange';

@Injectable()
export class AppService {
  getHello(): string {
    return 'hello';
  }

  async getVerificationCode(res: any, phoneNumber: number): Promise<any> {
    try {
      //send SMS
      console.log(phoneNumber);
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching or parsing data');
    }
  }

  async getSubmission(res: any, verificationCode: number): Promise<any> {
    try {
      //send SMS
      console.log(verificationCode);
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching or parsing data');
    }
  }
}
