import crypto from 'node:crypto';
import Bowser from 'bowser';

export default class AuthService {
    public static async saltPassword(password: string): Promise<string> {
        const nonce = crypto.randomBytes(32);
        const argonparams: crypto.Argon2Parameters = {
            message: password,
            nonce: nonce,
            parallelism: 4,
            tagLength: 32,
            memory: 65536,
            passes: 3
        };

        const key = await new Promise<Buffer>((resolve, reject) => {
            crypto.argon2('argon2id', argonparams, (err, derivedKey) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(derivedKey);
                }
            });   
        });
        const m = argonparams.memory;
        const t = argonparams.passes;
        const p = argonparams.parallelism;
        const base64nonce = nonce.toString('base64').replace(/=/g, '');
        const hash = key.toString('base64').replace(/=/g, '');
        return `$argon2id$v=19$m=${m},t=${t},p=${p}$${base64nonce}$${hash}`;
    }

    public static async checkPassword(userpassword: string, dbhash: string) {
        // absolute fuckery to parse the standard argon salt-hash format
        const parts = dbhash.split('$');
        if (parts.length !== 6) return false;
        const [, algorithm, version, paramsString, base64nonce, base64orighash]: string[] = parts;
        const parsedparams = paramsString?.split(',').reduce((obj, curr) => {
            const [key, value]: string[] = curr.split('=');
            if (!key || !value) throw Error("Bad user db object");
            obj[key] = parseInt(value);
            return obj;
        }, {} as Record<string, number>);
        if (!parsedparams || !base64nonce || !base64orighash) throw Error("Bad user db object");
        // Convert base64 back to node buffers
        const nonce = Buffer.from(base64nonce, 'base64');
        const params: crypto.Argon2Parameters = {
            message: userpassword,
            nonce: nonce,
            memory: parsedparams['m'] ?? 65536,
            passes: parsedparams['t'] ?? 3,
            parallelism: parsedparams['p'] ?? 4,
            tagLength: 32,
        }
        
        const attemptHash = await new Promise<Buffer>((resolve, reject) => {
                crypto.argon2('argon2id', params, (err, derivedKey) => {
                    if (err) reject(err);
                    else resolve(derivedKey);
                });
        });

        const orighash = Buffer.from(base64orighash, 'base64');
        if (orighash.length !== attemptHash.length) throw Error("Hash lengths dont match! Potentially malformed user db objects.")
        return crypto.timingSafeEqual(attemptHash, orighash);
    }

    public static readonly generateVerificationKey = async () => {
        return crypto.randomBytes(32).toString('hex');
    }

    public static getBrowserInfo(ua: string): string {
        const browser = Bowser.getParser(ua);
        return `${browser.getBrowserName(false)} ${browser.getBrowserVersion()} on ${browser.getPlatformType(false)}`;
    }
}