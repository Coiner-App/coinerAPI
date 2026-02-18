import { type FastifyPluginAsync } from "fastify";
import CoinProvider from "./coin.provider.js"
import { type CoinType, CoinSchema } from "./coin.schema.js";
import { Type } from "typebox";

export const CoinRoutes: FastifyPluginAsync = async (app, options) => {
    app.get<{ Reply: CoinType[] }>('/coin/all',
        {
            schema: {
                response: {
                    200: { type: 'array', data: Type.Array(CoinSchema) }
                },
            },
        },
        async (request, reply) => {
            const coinProvider = new CoinProvider();
            const res = await coinProvider.getAllCoinsData(['bitcoin', 'ethereum', 'dogecoin']);
            console.log(res);
            return res;
        })
}