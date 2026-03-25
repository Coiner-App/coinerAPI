import type CoinRepository from "../coin/coin.repository.js";
import { type SupportedCoins } from "../coin/coin.schema.js";
import type FiatRepository from "../fiat/fiat.repository.js";
import type { SupportedCurrency } from "../fiat/fiat.schema.js";
import type UserRepository from "../user/user.repository.js";
import type { PortfolioType } from "./portfolio.schema.js";

export default class PortfolioController {
    constructor(private readonly userRepository: UserRepository, private readonly fiatRepository: FiatRepository, private readonly coinRepository: CoinRepository) {}

    public async getPortfolio(userid: string, currency: SupportedCurrency = 'usd'): Promise<PortfolioType | null> {
        const res = await this.userRepository.getUserPortfolio(userid);
        if (!res) return null;

        const fiatRate = await this.fiatRepository.getRate(currency);
        const userAssets = Object.entries(res) as [SupportedCoins, number][];
        const symbolsToFetch = userAssets
            .filter(([, amount]) => amount > 0)
            .map(([symbol]) => symbol);

        const coinData = await this.coinRepository.getCoinData(symbolsToFetch);

        const assets = coinData.map(coin => {
            const amount = res[coin.symbol as SupportedCoins] || 0;
            const priceUsd = coin.pricedata['usd']?.price || 0;
            return {
                symbol: coin.symbol as SupportedCoins,
                amount: amount,
                value: amount * priceUsd * fiatRate
            };
        });

        const totalValue = assets.reduce((acc, asset) => acc + asset.value, 0);

        return {
            totalValue,
            currency,
            assets
        };
    }
}