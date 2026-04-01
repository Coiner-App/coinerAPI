import { ObjectId, Timestamp } from 'mongodb';
import MongoCommunicator from '../../shared/utils/mongo.communicator.js';
import type { SupportedCoins } from '../coin/coin.schema.js';
import { ApiError } from '../../shared/errors.js';
import type { TransactionType } from './trade.schema.js';
import { Collections } from '../../shared/db.collections.js';

export default class TradeRepository {

    private readonly userCollection = Collections.USERS;
    private readonly transactionCollection = Collections.TRANSACTIONS;

    constructor(private readonly mongo: MongoCommunicator) {}

    /**
     * Updates a user's portfolio by decrementing one asset and incrementing another.
     * 
     * @param userId - The ID of the user performing the trade
     * @param fromAsset - The symbol of the asset being sold
     * @param toAsset - The symbol of the asset being bought
     * @param sellAmount - The amount to subtract from fromAsset
     * @param buyAmount - The amount to add to toAsset
     * @returns Boolean indicating if the update was successful
     */
    public async executeSwap(userId: string | ObjectId, fromAsset: SupportedCoins, toAsset: SupportedCoins, sellAmount: number, buyAmount: number, fee: number = buyAmount * 0.01): Promise<TransactionType> {
        const user = typeof userId === 'string' ? new ObjectId(userId) : userId
        const result = await this.mongo.db.collection(this.userCollection).updateOne({
            _id: user,
            [`coins.${fromAsset}`]: { $gte: sellAmount }
        },
        {
            $inc: {
                [`coins.${fromAsset}`]: -sellAmount,
                [`coins.${toAsset}`]: buyAmount - fee
            }
        }
        );

        if (result.matchedCount === 0) {
            const userExists = await this.mongo.findById(this.userCollection, user);
            if (!userExists) throw new ApiError(404, `User with ID ${userId} not found.`);
            throw new ApiError(400, `Insufficient balance of ${fromAsset} to complete this trade.`);
        }

        return this.saveTransaction(userId, fromAsset, toAsset, sellAmount, buyAmount, fee);
    }

    public async saveTransaction(userId: string | ObjectId, fromAsset: SupportedCoins, toAsset: SupportedCoins, sellAmount: number, buyAmount: number, fee: number): Promise<TransactionType> {
        const transactionDb = {
            userId: typeof userId === 'string' ? new ObjectId(userId) : userId,
            timestamp: new Date().toISOString(),
            from: fromAsset,
            to: toAsset,
            amount: sellAmount,
            rate: buyAmount,
            fee,
        }
        const result = await this.mongo.db.collection(this.transactionCollection).insertOne(transactionDb);
        const transactionObj: TransactionType = {
            ...transactionDb,
            _id: result.insertedId.toString(),
            userId: transactionDb.userId.toString(),
        }
        return transactionObj;
    }
}
