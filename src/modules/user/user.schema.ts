import { Type, type Static } from 'typebox';
import { CryptoKeySchema } from '../coin/coin.schema.js'

export const UserSchema = Type.Object({
    publicid: Type.Integer(),
    username: Type.String({ minLength: 3, maxLength: 16 }),
    displayname: Type.String({ minLength: 2, maxLength: 32 }),
    email: Type.String({ format: 'email' }),
    password: Type.String(),
    coins: Type.Partial(Type.Record(CryptoKeySchema, Type.Number({ min: 0 })), { minProperties: 1 }),
    private: Type.Boolean({ default: true }),
    privatemail: Type.Boolean({ default: true }),
    verified: Type.Boolean({ default: false })
});

export type UserType = Static<typeof UserSchema>;