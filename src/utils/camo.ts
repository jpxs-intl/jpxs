import crypto from 'crypto';

export default class Camo {

    static cache = new Map<string, string>();
    static whiteListedHosts = [
        'imgur.com',
        'i.imgur.com',
        'steamcdn-a.akamaihd.net',
        'cdn.akamai.steamstatic.com',
        'assets.jpxs.io',
    ]

    static generateCamoUrl(inputUrl: string) {

        if (!inputUrl) {
            return null;
        }


        if (this.cache.has(inputUrl)) {
            return this.cache.get(inputUrl);
        }

        const urlObj = new URL(inputUrl);
        if (this.whiteListedHosts.includes(urlObj.hostname)) {
            return inputUrl;
        }

        const hex = crypto.createHmac('sha1', process.env.CAMO_SECRET as string).update(inputUrl).digest('hex');
        const url = Buffer.from(inputUrl).toString('hex');
        return `https://camo.jpxs.io/${hex}/${url}`;
    }
}
