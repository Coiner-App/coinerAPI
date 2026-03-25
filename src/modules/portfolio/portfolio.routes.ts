import { Type, type FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { requireAuth } from '../auth/auth.prehandler.js';
import PortfolioController from './portfolio.controller.js';
import { CurrencyKeySchema } from '../fiat/fiat.schema.js';
import { PortfolioSchema } from './portfolio.schema.js';

export const PortfolioRoutes: FastifyPluginAsyncTypebox = async (app, options) => {
    const fiatRepository = app.fiatRepository;
    const coinRepository = app.coinRepository;
    const userRepository = app.userRepository;
    const portfolioController = new PortfolioController(userRepository, fiatRepository, coinRepository);

    app.addHook('preHandler', requireAuth);
    app.get('/user/portfolio', {
        schema: {
            querystring: Type.Object({ currency: CurrencyKeySchema }),
            response: {
                '2xx': PortfolioSchema,
                '404': { statusCode: 404, message: 'Portfolio not found.' }
            },
        },
    }, async (request, reply) => {
        const id: string = request.user.user_id;
        return await portfolioController.getPortfolio(id, request.query.currency) ?? reply.status(404).send({ statusCode: 404, message: 'Portfolio not found.' });
    });
};