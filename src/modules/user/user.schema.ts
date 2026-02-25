import { Type, type Static } from 'typebox';
import { supported_coins } from '../coin/coin.schema.js'

const dynamicCoinsObject = Object.fromEntries(
    supported_coins.map(coin => [
        coin,
        Type.Number({ min: 0 }),
    ])
);

export const UserSchema = Type.Object({
    publicid: Type.Integer(),
    username: Type.String({ minLength: 3, maxLength: 16 }),
    displayname: Type.String({ minLength: 2, maxLength: 32 }),
    email: Type.String({ format: 'email' }),
    password: Type.String(),
    coins: Type.Object(dynamicCoinsObject),
    private: Type.Boolean({ default: true }),
    privatemail: Type.Boolean({ default: true }),
    verified: Type.Boolean({ default: false })
});

export type UserType = Static<typeof UserSchema>;