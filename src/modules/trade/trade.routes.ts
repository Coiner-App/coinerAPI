import { Type, type FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { requireAuth } from '../auth/auth.prehandler.js';
import { CryptoKeySchema } from '../coin/coin.schema.js';
import { SwapSchema, TransactionSchema } from './trade.schema.js';
import TradeRepository from './trade.repository.js';
import TradeController from './trade.controller.js';

export const TradeRoutes: FastifyPluginAsyncTypebox = async (app, options) => {
    const userRepository = app.userRepository;
    const coinRepository = app.coinRepository;
    const tradeRepository = new TradeRepository(app.mongoCommunicator);
    const tradeController = new TradeController(userRepository, tradeRepository, coinRepository);

    app.addHook('preHandler', requireAuth);

    app.post('/swap', {
        schema: {
            body: SwapSchema,
            response: {
                '2xx': TransactionSchema,
                400: Type.Object({ statusCode: Type.Number(), message: Type.String() })
            }
        }
    }, async (request, reply) => {
        const { fromAsset, toAsset, amount } = request.body;
        if (fromAsset == toAsset) return reply.status(400).send({ statusCode: 400, message: 'Cannot swap to the same asset.' });
        const transaction = await tradeController.swapCrypto(request.user.user_id, fromAsset, toAsset, amount);
        return transaction;
    });
}