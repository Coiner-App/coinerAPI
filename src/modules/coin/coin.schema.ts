import { Type, type Static } from 'typebox';
import { CurrencyKeySchema } from '../fiat/fiat.schema.js';

// errrrrr... it works
export const CoinRegistrySchema = Type.Object({
    USDT: Type.Literal('tether'),
    BTC: Type.Literal('bitcoin'),
    ETH: Type.Literal('ethereum'),
    DOGE: Type.Literal('dogecoin')
});
export const CryptoKeySchema = Type.KeyOf(CoinRegistrySchema);
export type SupportedCoins = Static<typeof CryptoKeySchema>;

export const PriceData = Type.Object({
    price: Type.Number(),
    marketcap: Type.Number(),
    volume: Type.Number(),
    change24h: Type.Number(),
    change7d: Type.Number(),
    change30d: Type.Number(),
    change1y: Type.Number(),
    ath: Type.Number(),
    atl: Type.Number(),
});

export type PriceDataType = Static<typeof PriceData>;

export const CoinSchema = Type.Object({
    geckoid: Type.String(),
    marketrank: Type.Number(),
    name: Type.String(),
    slug: Type.String(),
    symbol: Type.String(),
    description: Type.String(),
    pricedata: Type.Partial(Type.Record(CurrencyKeySchema, PriceData), { minProperties: 1 }),
    lastUpdated: Type.String({ format: 'date-time' }),
});

export type CoinType = Static<typeof CoinSchema>;