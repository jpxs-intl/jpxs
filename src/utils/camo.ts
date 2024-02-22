import crypto from 'crypto';

export default class Camo {

    static generateCamoUrl(inputUrl: string) {
        const hex = crypto.createHmac('sha1', process.env.CAMO_SECRET as string).update(inputUrl).digest('hex');
        const url = Buffer.from(inputUrl).toString('hex');
        return `https://camo.jpxs.io/${hex}/${url}`;
    }
}

