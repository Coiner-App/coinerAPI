import { type FastifyPluginAsync } from "fastify";
import { Type, type FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import CoinProvider from "./coin.provider.js"
import { type CoinType, type SupportedCoins, CoinRegistrySchema, CoinSchema, CryptoKeySchema } from "./coin.schema.js";
import { requireAuth } from "../auth/auth.prehandler.js";
import CoinRepository from "./coin.repository.js";

export const CoinRoutes: FastifyPluginAsyncTypebox = async (app, options) => {
    const coinRepository = app.coinRepository;

    app.addHook('preHandler', requireAuth);

    /**
     * Request to get the coin objects of all supported Coiner crypto in an array.
     */
    app.get('/coin/all', {
            schema: { response: { '2xx': Type.Array(CoinSchema) } },
        },
        async (request, reply) => {
            const res: CoinType[] = await coinRepository.getAllCoinData();
            return res;
        }
    );

    app.get('/coin/:coinid', {
            schema: { params: Type.Object({coinid: CryptoKeySchema}) }
        }, async (request, reply) => {
            const res: CoinType[] = await coinRepository.getCoinData([request.params.coinid]);
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
        const res = await coinRepository.getCoinData(requested as SupportedCoins[]);
        if (!res || res.length == 0) return reply.status(404).send({ statusCode: 404, message: 'Coin not found or does not exist.' });
        return res;
    });
}