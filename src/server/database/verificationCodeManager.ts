export default class VerificationCodeManager {

    private static codes: { [code: string]: { discordId: string, expires: number } } = {};

    public static generateCode(discordId: string): string {
        // Generate a random 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString()
        if (!code) throw new Error('Failed to generate code');

        if (this.codes[code]) {
            return this.generateCode(discordId);
        }

        this.codes[code] = {
            discordId,
            expires: Date.now() + 1000 * 60 * 5
        };

        return code;
    }

    public static verifyCode(code: string): string | undefined {
        if (!this.codes[code]) return undefined;
        if (this.codes[code].expires < Date.now()) {
            delete this.codes[code];
            return undefined;
        }

        let discordId = this.codes[code].discordId;
        delete this.codes[code];
        return discordId;
    }

    public static cleanup() {
        for (let code in this.codes) {
            if (this.codes[code].expires < Date.now()) {
                delete this.codes[code];
            }
        }
    }

}

setInterval(() => VerificationCodeManager.cleanup(), 1000 * 60 * 5); // Cleanup every 5 minutes