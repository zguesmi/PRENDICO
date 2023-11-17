import { Injectable } from '@nestjs/common';
import { parseStringPromise } from 'xml2js';
import Client from 'mina-signer';

const client = new Client({ network: 'mainnet' });

@Injectable()
export class AppService {
  getHello(): string {
    // Generate keys
    const keypair = client.genKeys();

    // Sign and verify message
    const signed = client.signMessage('hello', keypair.privateKey);
    if (client.verifyMessage(signed)) {
      console.log('Message was verified successfully');
    }
    return 'hello';
  }

  //   getSignature(
  //     userSessionId: string,
  //     disasterId: string,
  //     amount: number,
  //     salt: string,
  //   ): string {
  //     const hash = Signature.create('privateKey', [
  //       disasterId,
  //       userSessionId,
  //       amount,
  //       salt,
  //     ]).toString();
  //     return hash;
  //   }

  async getCountryCode(_ip: string): Promise<any> {
    //to remove
    const ip = '212.175.155.170';
    try {
      const response = await fetch(
        `http://api.ipstack.com/${ip}?access_key=${process.env.PRIVATE_KEY}`,
      );
      console.log(
        `http://api.ipstack.com/${ip}?access_key=${process.env.PRIVATE_KEY}`,
      );
      const json = await response.json();
      return json['country_name'];
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching or parsing data');
    }
  }

  async getDisaster(ip: string, userSessionId: string): Promise<any> {
    try {
      const level = 'Orange';
      let countryName = await this.getCountryCode(ip);

      const response = await fetch('https://gdacs.org/xml/rss.xml');
      const xml = await response.text();
      const json = await parseStringPromise(xml, { explicitArray: false });
      const items = json.rss.channel.item;

      let isDisaster = false;
      //to remove
      countryName = 'Philippines';
      items.forEach((disaster) => {
        if (
          disaster['gdacs:country'] == countryName &&
          disaster['gdacs:episodealertlevel'] == level
        ) {
          isDisaster = true;
        }
      });
      console.log(isDisaster);
      return items;
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching or parsing data');
    }
  }
}
