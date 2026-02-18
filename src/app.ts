import fastify, { type FastifyInstance } from "fastify";
import { CoinRoutes } from "./modules/coin/coin.routes.js";

export async function buildApp() {
    const app: FastifyInstance = fastify({ logger: true });

    app.register(CoinRoutes, { prefix: '/api' });

    app.get('/', async (request, reply) => {
        reply.send({ hello: 'world' });
    });

    return app;
}