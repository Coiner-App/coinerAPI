import { Type, type Static } from 'typebox';
import { supported_currencies } from '../fiat/fiat.schema.js';

export const supported_coins: string[] = ['USDT', 'BTC', 'ETH', 'DOGE'] as const;

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

const dynamicPriceObject = Object.fromEntries(
    supported_currencies.map(currency => [
        currency,
        Type.Optional(PriceData),
    ])
);

export const CoinSchema = Type.Object({
    geckoid: Type.String(),
    marketrank: Type.Number(),
    name: Type.String(),
    slug: Type.String(),
    symbol: Type.String(),
    description: Type.String(),
    pricedata: Type.Object(dynamicPriceObject),
    lastUpdated: Type.String({ format: 'date-time' }),
});

export type CoinType = Static<typeof CoinSchema>;