import { type FastifyPluginAsync } from "fastify";
import { Type, type FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import CoinProvider from "./coin.provider.js"
import { type CoinType, type SupportedCoins, CoinRegistrySchema, CoinSchema, CryptoKeySchema } from "./coin.schema.js";
import { requireAuth } from "../auth/auth.prehandler.js";
import CoinController from "./coin.controller.js";

export const CoinRoutes: FastifyPluginAsyncTypebox = async (app, options) => {
    const coinProvider = new CoinProvider();
    const coinController = new CoinController(coinProvider);

    app.addHook('preHandler', requireAuth);

    /**
     * Request to get the coin objects of all supported Coiner crypto in an array.
     */
    app.get('/coin/all', {
            schema: { response: { '2xx': Type.Array(CoinSchema) } },
        },
        async (request, reply) => {
            const res: CoinType[] = await coinController.getAllCoinData();
            return res;
        }
    );

    app.get('/coin/:coinid', { // optional so we can tell the users they need to use params
            schema: { params: Type.Object({coinid: CryptoKeySchema}) }
        }, async (request, reply) => {
            const res: CoinType[] = await coinController.getCoinData([request.params.coinid]);
            if (!res || res.length == 0) return reply.status(404).send({ statusCode: 404, message: 'Coin not found or does not exist.' });
            if (res.length > 1) {
                return res;
            } else {
                return res[0];
            }
        }
    );

    app.get('/coin', {
        schema: { querystring: Type.Object({ coinid: Type.String({ minLength: 2 }) }) }
    }, async (request, reply) => {
        const requested: string[] = request.query.coinid
            .split(',')
            .map(s => s.trim().toUpperCase());
        const allowedKeys = Object.keys(CoinRegistrySchema.properties);
        if (!requested || requested.length == 0) 
            return reply.status(404).send({ statusCode: 404, message: 'Coin not found or does not exist.' });
        if (requested.some(s => !allowedKeys.includes(s)))
            return reply.status(400).send({ statusCode: 400, message: `Invalid symbols provided. Supported are: ${allowedKeys.join(', ')}`});
        const res = await coinController.getCoinData(requested as SupportedCoins[]);
        if (!res || res.length == 0) return reply.status(404).send({ statusCode: 404, message: 'Coin not found or does not exist.' });
        return res;
    });
}