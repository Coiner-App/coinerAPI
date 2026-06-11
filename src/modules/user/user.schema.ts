import { Type, type Static } from 'typebox';
import { CryptoKeySchema } from '../coin/coin.schema.js'
import type { ObjectId } from 'mongodb';

export const UserCoinPortfolioSchema = Type.Partial(Type.Record(CryptoKeySchema, Type.Number({ min: 0 })),{ minProperties: 1 })
export type UserCoinPortfolioType = Static<typeof UserCoinPortfolioSchema>;
const ObjectIdType = Type.Unsafe<ObjectId>({ type: 'string' });

export const UserSchema = Type.Object({
    _id: Type.Optional(Type.Union([Type.String(), ObjectIdType])),
    publicid: Type.Integer(),
    username: Type.String({ minLength: 3, maxLength: 16 }),
    displayname: Type.String({ minLength: 2, maxLength: 32 }),
    email: Type.String({ format: 'email' }),
    password: Type.String(),
    coins: UserCoinPortfolioSchema,
    private: Type.Boolean({ default: true }),
    privatemail: Type.Boolean({ default: true }),
    verified: Type.Boolean({ default: false })
});
export type UserType = Static<typeof UserSchema>;