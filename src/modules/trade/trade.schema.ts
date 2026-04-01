import { Type, type Static } from 'typebox';
import { CryptoKeySchema } from '../coin/coin.schema.js';

export const SwapSchema = Type.Object({
    fromAsset: CryptoKeySchema,
    toAsset: CryptoKeySchema,
    amount: Type.Number({ minimum: 0 }),
});

export type SwapInput = Static<typeof SwapSchema>;

export const TransactionSchema = Type.Object({
    _id: Type.Optional(Type.String()),
    userId: Type.String(),
    timestamp: Type.String({ format: 'date-time' }),
    from: CryptoKeySchema,
    to: CryptoKeySchema,
    amount: Type.Number({ minimum: 0 }),
    rate: Type.Number({ minimum: 0 }),
    fee: Type.Number({ minimum: 0 }),
});

export type TransactionType = Static<typeof TransactionSchema>;