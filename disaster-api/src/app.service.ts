import { Injectable } from '@nestjs/common';
import { parseStringPromise } from 'xml2js';
import Client from 'mina-signer';
import { randomInt } from 'crypto';

const client = new Client({ network: 'testnet' });
const COMPENSATION = 1; // Send 1 MINA on disaster
const DISASTER_LEVEL = 'Orange';

@Injectable()
export class AppService {
  getHello(): string {
    return 'hello';
  }

  async getDisaster(res: any, ip: string, userSessionId: number): Promise<any> {
    try {
      let countryName = await this.getCountryCode(ip);

      const response = await fetch('https://gdacs.org/xml/rss.xml');
      const xml = await response.text();
      const json = await parseStringPromise(xml, { explicitArray: false });
      const items = json.rss.channel.item;

      let isDisaster = false;
      let disasterId: number;
      //to remove
      countryName = 'Philippines';
      items.forEach((disaster) => {
        if (
          disaster['gdacs:country'] == countryName &&
          disaster['gdacs:episodealertlevel'] == DISASTER_LEVEL
        ) {
          isDisaster = true;
          disasterId = disaster['gdacs:eventid'];
          return false; // exit if matching disaster
        }
      });
      if (!isDisaster) {
        return res.status(404).json({ error: 'No disaster to compensate' });
      }

      const fieldsResponse = {
        userSessionId: userSessionId,
        disasterId,
        salt: randomInt(1_000_000),
        amount: COMPENSATION,
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

  async getCountryCode(_ip: string): Promise<any> {
    //to remove
    const ip = '212.175.155.170';
    try {
      const response = await fetch(
        `http://api.ipstack.com/${ip}?access_key=${process.env.LOCATION_API_KEY}`,
      );
      console.log(
        `http://api.ipstack.com/${ip}?access_key=${process.env.LOCATION_API_KEY}`,
      );
      const json = await response.json();
      return json['country_name'];
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching or parsing data');
    }
  }

  signFields({
    userSessionId,
    disasterId,
    amount,
    salt,
  }: {
    userSessionId: number;
    disasterId: number;
    amount: number;
    salt: number;
  }): string {
    // Generate keys
    const keypair = client.genKeys(); //TODO: read .env

    const signed = client.signFields(
      [BigInt(userSessionId), BigInt(disasterId), BigInt(amount), BigInt(salt)],
      keypair.privateKey,
    );

    // Just checking
    if (client.verifyFields(signed)) {
      console.log('Fields was verified successfully');
    }

    return signed.signature;
  }
}
