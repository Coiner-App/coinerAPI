import { CoinRegistrySchema, type CoinType, type SupportedCoins } from './coin.schema.js';
import CoinProvider from './coin.provider.js';
import { TLLCache } from '../../shared/data.cache.js';

export default class CoinRepository {
    private readonly cache: TLLCache;

    constructor(private readonly coinProvider: CoinProvider) {
        // Cache for 30 minutes, max 100 entries
        this.cache = new TLLCache(100, 1800000);
    }

    /**
     * Retrieves data for an array of coins, using cache if available
     */
    public async getCoinData(coins: SupportedCoins[]): Promise<CoinType[]> {
        if (coins.length === 0) return [];
        const needsRefresh: boolean = coins.some(slug => !this.cache.get(slug));

        // refresh cache
        if (needsRefresh) {
            await this.refreshCoinData();
        }

        const coinArray: CoinType[] = [];
        for (const slug of coins) {
            const res = this.cache.get<CoinType>(slug);
            if (res) coinArray.push(res);
        }

        return coinArray;
    }

    public async getAllCoinData(): Promise<CoinType[]> {
        const allCoins = Object.values(CoinRegistrySchema.properties).map(coin => coin.const);
        let coinArray: CoinType[] = [];
        for (const slug of allCoins) {
            const res = this.cache.get<CoinType>(slug);
            if (!res) {
                coinArray = await this.refreshCoinData();
                break;
            }
            coinArray.push(res);
        }
        return coinArray;
    }

    /**
     * Recaches all coins in the TTL cache
     */
    public async refreshCoinData(): Promise<CoinType[]> {
        const coins: CoinType[] = await this.coinProvider.getAllCoinsData();

        for (const coin of coins) {
            this.cache.set(coin.symbol, coin, 1800);
        };
        return coins;
    }
}
