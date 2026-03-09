import { type FastifyPluginAsync } from "fastify";
import { Type, type FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import CoinProvider from "./coin.provider.js"
import { type CoinType, CoinSchema } from "./coin.schema.js";
import { requireAuth } from "../auth/auth.prehandler.js";

export const CoinRoutes: FastifyPluginAsyncTypebox = async (app, options) => {
    const coinProvider = new CoinProvider();

    app.addHook('preHandler', requireAuth);

    /**
     * Request to get the coin objects of all supported Coiner crypto in an array.
     */
    app.get('/coin/all', {
            schema: { response: { '2xx': Type.Array(CoinSchema) } },
        },
        async (request, reply) => {
            const res = await coinProvider.getAllCoinsData(['bitcoin', 'ethereum', 'dogecoin']);
            return res;
        }
    );

    app.get('/coin/:coinid?', { // optional so we can tell the users they need to use params
            schema: { params: Type.Object({coinid: Type.String({ minLength: 2, maxLength: 20 })}) }
        }, async (request, reply) => {
            const res = await coinProvider.getAllCoinsData([request.params.coinid]);
            if (!res || res.length == 0) return reply.status(404).send({ statusCode: 404, message: 'Coin not found or does not exist.' });
            if (res.length > 1) {
                return res;
            } else {
                return res[0];
            }
        }
    ); 
}