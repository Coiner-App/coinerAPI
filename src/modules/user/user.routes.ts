import { type FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type } from 'typebox';
import { requireAuth } from '../auth/auth.prehandler.js';
import { UserSchema } from './user.schema.js';

export const UserRoutes: FastifyPluginAsyncTypebox = async (app, options) => {

    app.get('/me', {
        preHandler: [requireAuth],
        schema: {
            response: {
                '2xx': Type.Omit(UserSchema, ['password']),
                '404': Type.Object({
                    code: Type.Integer({ default: 400 }),
                    message: Type.String()
                }),
            }
        }
    }, async (request, reply) => {
        const user = await app.userRepository.findById(request.user.user_id);
        if (!user) return reply.status(404).send({ code: 404, message: "User not found" });
        user.password = "";
        return reply.status(200).send(user);
    });

}
