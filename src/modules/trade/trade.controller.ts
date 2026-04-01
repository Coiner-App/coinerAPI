import { ApiError } from "../../shared/errors.js";
import CoinRepository from "../coin/coin.repository.js";
import type { SupportedCoins } from "../coin/coin.schema.js";
import FiatRepository from "../fiat/fiat.repository.js";
import UserRepository from "../user/user.repository.js";
import type TradeRepository from "./trade.repository.js";

export default class TradeController {
    constructor(private readonly userRepository: UserRepository, private readonly tradeRepository: TradeRepository, private readonly coinRepository: CoinRepository) {}

    public async swapCrypto(userid: string, fromAsset: SupportedCoins, toAsset: SupportedCoins, amount: number) {
        const coinData = await this.coinRepository.getCoinData([fromAsset, toAsset]);
        if (!coinData) throw new ApiError(404, 'Coin not found');

        const fromPriceUSD = coinData.find(coin => coin.symbol === fromAsset)?.pricedata.usd?.price;
        const toPriceUSD = coinData.find(coin => coin.symbol === toAsset)?.pricedata.usd?.price;
        if (!fromPriceUSD || !toPriceUSD) throw new ApiError(500, 'Coin price not found');

        const rate = (fromPriceUSD * amount) / toPriceUSD;
        const fee = rate * 0.01;
        const buyAmount = rate;

        const transaction = await this.tradeRepository.executeSwap(userid, fromAsset, toAsset, amount, buyAmount, fee);
        return transaction;
    }
}