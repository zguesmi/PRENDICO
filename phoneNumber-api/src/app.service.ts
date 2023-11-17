import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import Client from 'mina-signer';

const client = new Client({ network: 'testnet' });
const phoneNumberToChallengeCode: [number, number][] = [];

@Injectable()
export class AppService {
  getHello(): string {
    return 'hello';
  }

  async getVerificationCode(res: any, phoneNumber: number): Promise<any> {
    try {
      //TODO: send SMS

      const challengeCode = randomInt(1_000_000);
      phoneNumberToChallengeCode.push([phoneNumber, challengeCode]);
      return res.status(200).json({ code: challengeCode });
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching or parsing data');
    }
  }

  async verifyCode(
    res: any,
    verificationCode: number,
    userSessionId: number,
  ): Promise<any> {
    try {
      //find the code verification in the mapping
      console.log(phoneNumberToChallengeCode);
      const matchingPhoneNumber = phoneNumberToChallengeCode.find(
        ([_, code]) => code == Number(verificationCode),
      )?.[0];

      if (matchingPhoneNumber === undefined) {
        // No matching phone number found, return a 404 error
        return res.status(404).json({ error: 'Phone number not found' });
      }

      const fieldsResponse = {
        userSessionId: userSessionId,
        phoneNumber: matchingPhoneNumber,
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
      throw new Error('Error fetching or parsing data');
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
    const keypair = client.genKeys(); //TODO: read .env

    const signed = client.signFields(
      [BigInt(userSessionId), BigInt(phoneNumber), BigInt(salt)],
      keypair.privateKey,
    );

    // Just checking
    if (client.verifyFields(signed)) {
      console.log('Fields was verified successfully');
    }

    return signed.signature;
  }
}
