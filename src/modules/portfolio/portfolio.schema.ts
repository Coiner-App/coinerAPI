import { Type, type Static } from 'typebox';
import { CurrencyKeySchema } from '../fiat/fiat.schema.js';
import { CryptoKeySchema } from '../coin/coin.schema.js';

export const PortfolioSchema = Type.Object({
    totalValue: Type.Number({ minimum: 0 }),
    currency: CurrencyKeySchema,
    assets: Type.Array(Type.Object({
        symbol: CryptoKeySchema,
        amount: Type.Number({ minimum: 0 }),
        value: Type.Number({ minimum: 0 })
    }))
});

export type PortfolioType = Static<typeof PortfolioSchema>;