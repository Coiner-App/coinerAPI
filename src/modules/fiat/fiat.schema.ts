import { Type, type Static } from 'typebox';

export const CurrencyKeySchema = Type.Union([
    Type.Literal('usd'),
    Type.Literal('eur'),
    Type.Literal('gbp'),
    Type.Literal('rub')
]);
export type SupportedCurrency = Static<typeof CurrencyKeySchema>;

export const FiatRateSchema = Type.Object({
    date: Type.String(),
    rates: Type.Record(CurrencyKeySchema, Type.Number())
});

export type FiatRateType = Static<typeof FiatRateSchema>;

export const FiatConversionSchema = Type.Object({
    from: Type.String(),
    to: Type.String(),
    amount: Type.Number(),
    result: Type.Number(),
    rate: Type.Number(),
    date: Type.String()
});

export type FiatConversionType = Static<typeof FiatConversionSchema>;
