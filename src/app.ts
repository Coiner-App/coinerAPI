import fastify, { type FastifyInstance } from "fastify";
import { CoinRoutes } from "./modules/coin/coin.routes.js";
import { AuthRoutes } from "./modules/auth/auth.routes.js";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Db, MongoClient } from "mongodb";
import { config } from "./config/env.js";
import EmailService from "./shared/utils/email.service.js";
import { DataPlugin } from "./shared/data.plugin.js";
import { setServers } from "node:dns/promises";
import { PortfolioRoutes } from "./modules/portfolio/portfolio.routes.js";
import type { AuthPayload } from "./modules/auth/auth.prehandler.js";

export async function buildApp() {
    // DEV ENV SETUP //
    if (config.isDev) {
        setServers(["8.8.8.8", "1.1.1.1"]);
    }
    // HELPER CLASSES SETUP //
    // Database
    const client = await MongoClient.connect(config.mongoUri);
    const db = client.db();
    // Clean up pending users after 1800 seconds (30 mins)
    await db.collection('pending_users').createIndex(
        { "createdAt": 1 }, 
        { expireAfterSeconds: 1800 } 
    );
    
    // ENSURE WE ALWAYS HAVE UNIQUE EMAILS AND USERNAMES !!! //
    // We actually do not need to run this at every app.ts start,
    // but it will (should) be skipped if the index is already created
    await db.collection('pending_users').createIndex({ email: 1 }, { unique: true });
    await db.collection('pending_users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('sessions').createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });
    
    // Email client
    const emailService: EmailService = new EmailService();

    // SERVER SETUP //
    const app: FastifyInstance = fastify({ logger: true }).withTypeProvider<TypeBoxTypeProvider>();
    app.decorateRequest('user', null as unknown as AuthPayload);

    app.register(DataPlugin, { db, emailService });
    
    app.register(AuthRoutes, { prefix: '/auth' });
    app.register(CoinRoutes, { prefix: '/api' });
    app.register(PortfolioRoutes, { prefix: '/api' });

    // DEFAULT TEST ENDPOINT //
    app.get('/', async (request, reply) => {
        reply.send({ hello: 'world' });
    });

    return app;
}