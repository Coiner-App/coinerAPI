import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { fastifyPlugin } from 'fastify-plugin';

/**
 * Disables cors on dev env
 */
const devCorsAsync: FastifyPluginAsync = async(app: FastifyInstance) => {
    app.addHook('onRequest', async (request, reply) => {
        const origin = request.headers.origin;

        // Allow only localhost
        if (origin && (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'))) {
            reply.header('Access-Control-Allow-Origin', origin);
            reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

            if (request.method === 'OPTIONS') {
                reply.code(204).send();
                return;
            }
        }
    });
}

export const devCorsPlugin = fastifyPlugin(devCorsAsync, {
    name: 'dev-cors-plugin'
});