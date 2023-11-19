import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import Client from 'mina-signer';
import twilio from 'twilio';

const client = new Client({ network: 'testnet' });

@Injectable()
export class AppService {
  getHello(): string {
    return 'hello';
  }

  async getVerificationCode(res: any, phoneNumber: string): Promise<any> {
    try {
      const twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );
      //send SMS
      const verification = await twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SID)
        .verifications.create({ to: '+' + phoneNumber, channel: 'sms' });

      return res.status(200).json({ status: verification.status });
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching or parsing data');
    }
  }

  async verifyCode(
    res: any,
    phoneNumber: string,
    verificationCode: string,
    userSessionId: number,
  ): Promise<any> {
    try {
      const twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );

      //check is the code is correct
      const verify = await twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SID)
        .verificationChecks.create({
          to: '+' + phoneNumber,
          code: verificationCode,
        });
      console.log(verify.status);

      if (verify.status === 'canceled' || verify.status === 'pending') {
        // No matching phone number found, return a 404 error
        return res.status(404).json({ error: 'Invalid code number' });
      }

      const fieldsResponse = {
        userSessionId: userSessionId,
        phoneNumber: Number(phoneNumber),
        salt: randomInt(1_000_000),
      };
      const sign = this.signFields(fieldsResponse);
      const finalResponse = {
        ...fieldsResponse,
        sign,
      };
      return res.status(200).json(finalResponse);
    } catch (error) {
      console.error(error);
      //workaround
      return res.status(404).json({ error: 'Invalid code number' });
    }
  }

  signFields({
    userSessionId,
    phoneNumber,
    salt,
  }: {
    userSessionId: number;
    phoneNumber: number;
    salt: number;
  }): string {
    // Generate keys
    const signerPrivateKey = process.env.SIGNER_PRIVATE_KEY;

    const signed = client.signFields(
      [BigInt(userSessionId), BigInt(phoneNumber), BigInt(salt)],
      signerPrivateKey,
    );

    // Just checking
    if (client.verifyFields(signed)) {
      console.log('Fields was verified successfully');
    }

    return signed.signature;
  }
}
