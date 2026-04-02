import axios from 'axios';
import { config } from '../../config/env.js';
import { type CoinType, type PriceDataType, CoinRegistrySchema, CryptoKeySchema } from './coin.schema.js';
import { ApiError } from '../../shared/errors.js';

export default class CoinProvider {
    private readonly baseUrl = 'https://api.coingecko.com/api/v3';

    /**
     * Maps a GeckoCoin market array data object to an [CoinType] Object
     * @param {any} raw - The raw coin object from GeckoCoins market array
     * @param {string} currency - The currency from the GeckoCoin market API call
     **/
    private mapGeckoToCoin(raw: any, currency: string): CoinType {
        const getPriceData: PriceDataType = {
            price: (raw.current_price as number) ?? 0,
            marketcap: (raw.market_cap as number) ?? 0,
            volume: (raw.total_volume as number) ?? 0,
            change24h: (raw.price_change_percentage_24h_in_currency as number) ?? 0,
            change7d: (raw.price_change_percentage_7d_in_currency as number) ?? 0,
            change30d: (raw.price_change_percentage_30d_in_currency as number) ?? 0,
            change1y: (raw.price_change_percentage_1y_in_currency as number) ?? 0,
            ath: (raw.ath as number) ?? 0,
            atl: (raw.atl as number) ?? 0
        };

        return {
            geckoid: raw.id,
            marketrank: raw.market_cap_rank || 0,
            name: raw.name,
            slug: raw.id,
            symbol: raw.symbol?.toUpperCase(),
            description: raw.description || '',
            pricedata: {
                [currency]: getPriceData,
            },
            lastUpdated: new Date(raw.last_updated || Date.now()).toISOString(),
        };
    }

    /**
     * Takes an array of coin ids and retrieves their information and price data from the crypto api
     * @param coinIds - an array of the coin ids that should be retrieved
     * @returns A cointype array containing the requested coins with their prices in USD
     */
    public async getCoinsData(coinIds: string[]): Promise<CoinType[]> {
        if (coinIds.length == 0 || coinIds[0] == '') throw new Error("No coins provided!");
        try {
            const response = await axios.get(`${this.baseUrl}/coins/markets`, {
                headers: {
                    'x-cg-demo-api-key': config.geckoKey
                },
                params: {
                    locale: 'en',
                    precision: 2,
                    order: 'market_cap_desc',
                    per_page: 100,
                    page: 1,
                    sparkline: true,
                    ids: coinIds.join(','),
                    vs_currency: 'usd',
                    price_change_percentage: '1h,24h,7d,30d,1y'
                }
            });

            const data = response.data as unknown[];
            const coins: CoinType[] = [];
            data.map(coin => {
                coins.push(this.mapGeckoToCoin(coin, 'usd'));
            });

            return coins;
        } catch (error) {
            console.error("Coin Provider Error:", error);
            throw new ApiError(502, "Could not retrieve coin data at this time.");
        }
    }

    /**
     * Gets all supported coins from the Crypto API
     * @async
     * @returns CoinType[] array containing all supported coins
     */
    public async getAllCoinsData(): Promise<CoinType[]> {
        const allCoins = Object.values(CoinRegistrySchema.properties).map(coin => coin.const);
        try {
            const response = await axios.get(`${this.baseUrl}/coins/markets`, {
                headers: {
                    'x-cg-demo-api-key': config.geckoKey
                },
                params: {
                    locale: 'en',
                    precision: 2,
                    order: 'market_cap_desc',
                    per_page: 100,
                    page: 1,
                    sparkline: true,
                    ids: allCoins.join(','),
                    vs_currency: 'usd',
                    price_change_percentage: '1h,24h,7d,30d,1y'
                }
            });

            const data = response.data as unknown[];
            const coins: CoinType[] = data.map(coin => this.mapGeckoToCoin(coin, 'usd'));

            return coins;
        } catch (error) {
            console.error("Coin Provider Error:", error);
            throw new ApiError(502, "Could not retrieve coin data at this time.");
        }
    }
}