import { type FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { requireAuth } from '../auth/auth.prehandler.js';
import PortfolioController from './portfolio.controller.js';

export const PortfolioRoutes: FastifyPluginAsyncTypebox = async (app, options) => {
    const fiatRepository = app.fiatRepository;
    const coinRepository = app.coinRepository;
    const userRepository = app.userRepository;
    const portfolioController = new PortfolioController(userRepository);

    app.addHook('preHandler', requireAuth);
    app.get('/user/portfolio', {
        schema: {}
    }, async (request, reply) => {
        const id: string = request.user.user_id;
        return portfolioController.getPortfolio(id);
    });
};