import axios from "axios";
import type { FiatConversionType, FiatRateType, SupportedCurrency } from "./fiat.schema.js";
import HttpUtils from "../../shared/utils/http.utils.js";
import { ApiError } from "../../shared/errors.js";

export default class FiatProvider {
    private readonly baseUrl = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1";
    private readonly backupUrl = "https://latest.currency-api.pages.dev/v1";

    /**
     * Gets rates from a specified currency, from the fiat api
     * @param base - what currency to convert from
     * @returns An object containing the rates from the currency specified to all supported ones
     */
    public async getRates(base: SupportedCurrency = 'usd'): Promise<Record<string, number>> {
        try {
            const endpoint = `/currencies/${base}.json`;
            const response = await HttpUtils.getWithFallback<any>(
                [this.baseUrl, this.backupUrl], 
                endpoint
            );
            
            return response.data[base];
        } catch (error) {
            console.error("Fiat Provider Error:", error);
            throw new ApiError(502, "Could not retrieve fiat exchange rates at this time.");
        }
    }

    /**
     * Maps fiat exchange object to [FiatRateType]
     * @param data
     * @param from 
     * @returns FiatRateType
     */
    private static mapExchangeToType(data: any, from: SupportedCurrency): FiatRateType {
        return {
            date: data.date,
            rates: {
                ...data[from]
            }
        }
    }

    /**
     * currently unused convert function, converts from one currency to another using the fiat rate api
     */
    public async convert(from: SupportedCurrency, to: SupportedCurrency, amount: number): Promise<FiatConversionType> {
        if (from == to) return { amount, from, to, result: amount, rate: 1, date: new Date().toISOString() };
        try {
            const response = await HttpUtils.getWithFallback([this.baseUrl, this.backupUrl], `/currencies/${from}.json`);
            if (response.status != 200) {
                console.error(response.data);
                throw new ApiError(502, "Could not retrieve exchange data at this time.");
            }
            const data = response.data;
            const mapped: FiatRateType = FiatProvider.mapExchangeToType(data, from);
            return {
                from,
                to,
                amount,
                rate: mapped.rates[to],
                result: amount * mapped.rates[to],
                date: mapped.date
            }
        } catch (error) {
            console.error("Fiat Provider Error:", error);
            throw new ApiError(502, "Could not retrieve fiat exchange rates at this time.");
        }
    }
}