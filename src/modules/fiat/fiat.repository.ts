import { TLLCache } from "../../shared/data.cache.js";
import { ApiError } from "../../shared/errors.js";
import type FiatProvider from "./fiat.provider.js";
import type { SupportedCurrency } from "./fiat.schema.js";

export default class FiatRepository {
    private readonly cache: TLLCache;
    constructor(private readonly fiatProvider: FiatProvider) {
        this.cache = new TLLCache(100, 7200000) // 2 hours
    }

    public async getRate(to: SupportedCurrency, from: SupportedCurrency = 'usd'): Promise<number> {
        if (from == to) return 1;
        let rates = this.cache.get<Record<string, number>>(from);
        if (!rates) rates = await this.refreshAllRates(from);
        if (!rates[to]) throw new ApiError(501, `Could not retrieve fiat currency rate for ${from} to ${to}`);
        return rates[to];
    }

    public async refreshAllRates(from: SupportedCurrency): Promise<Record<string, number>> {
        const rates = await this.fiatProvider.getRates(from);
        this.cache.set(from, rates, 7200);
        return rates;
    }
}