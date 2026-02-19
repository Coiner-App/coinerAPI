import fastify, { type FastifyInstance } from "fastify";
import { CoinRoutes } from "./modules/coin/coin.routes.js";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

export async function buildApp() {
    const app: FastifyInstance = fastify({ logger: true }).withTypeProvider<TypeBoxTypeProvider>();

    app.register(CoinRoutes, { prefix: '/api' });

    app.get('/', async (request, reply) => {
        reply.send({ hello: 'world' });
    });

    return app;
}