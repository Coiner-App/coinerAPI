import { Type, type Static } from 'typebox';
import { CryptoKeySchema } from '../coin/coin.schema.js'
import type { ObjectId } from 'mongodb';

export const UserCoinPortfolioSchema = Type.Partial(Type.Record(CryptoKeySchema, Type.Number({ min: 0 })),{ minProperties: 1 })
export type UserCoinPortfolioType = Static<typeof UserCoinPortfolioSchema>;

export const UserSchema = Type.Object({
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
export type UserBase = Static<typeof UserSchema>;

export const UserResponseSchema = Type.Intersect([
    Type.Object({ _id: Type.String() }),
    Type.Omit(UserSchema, ['password'])
]);
export type UserResponse = Static<typeof UserResponseSchema>;

// DTO
export type UserType = UserBase & {
    _id: ObjectId;
};

