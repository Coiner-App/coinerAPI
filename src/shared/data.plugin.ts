import type { FastifyPluginAsync } from "fastify";
import CoinProvider from "../modules/coin/coin.provider.js";
import CoinRepository from "../modules/coin/coin.repository.js";
import FiatProvider from "../modules/fiat/fiat.provider.js";
import FiatRepository from "../modules/fiat/fiat.repository.js";
import fastifyPlugin from "fastify-plugin";
import type { Db } from "mongodb";
import type EmailService from "./utils/email.service.js";
import MongoCommunicator from "./utils/mongo.communicator.js";
import UserRepository from "../modules/user/user.repository.js";

declare module 'fastify' {
    interface FastifyInstance {
        fiatRepository: FiatRepository;
        coinRepository: CoinRepository;
        userRepository: UserRepository;
        db: Db;
        mongoCommunicator: MongoCommunicator;
        emailService: EmailService;
    }
}

export interface DataPluginOptions {
    db: Db;
    emailService: EmailService;
}

const DataPluginAsync: FastifyPluginAsync<DataPluginOptions> = async (app, options) => {
    const fiatProvider = new FiatProvider();
    const fiatRepository = new FiatRepository(fiatProvider);

    const coinProvider = new CoinProvider();
    const coinRepository = new CoinRepository(coinProvider);

    const mongoCom = new MongoCommunicator(options.db)
    
    const userRepository = new UserRepository(mongoCom);

    app.decorate('db', options.db);
    app.decorate('mongoCommunicator', mongoCom);
    app.decorate('emailService', options.emailService);
    app.decorate('userRepository', userRepository);
    app.decorate('fiatRepository', fiatRepository);
    app.decorate('coinRepository', coinRepository);
};

export const DataPlugin = fastifyPlugin(DataPluginAsync, {
    name: 'data-plugin'
});