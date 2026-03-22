import { type FastifyRequest, type FastifyReply } from 'fastify';
import * as jose from 'jose';
import { config } from '../../config/env.js';
import { ApiError } from '../../shared/errors.js';

export type AuthPayload = {
    user_id: string;
    email: string;
    username: string;
    displayname: string;
}

declare module 'fastify' {
    interface FastifyRequest {
        user: AuthPayload;
    }
}

export const requireAuth = async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(401, "Missing or invalid authorization header");
    }

    const token = authHeader.substring(7).trim();
    if (!token) throw new ApiError(401, "Missing or invalid authorization header");

    try {
        const secretKey = await jose.importJWK(config.jwkSecret);
        const { payload } = await jose.jwtVerify<AuthPayload>(token, secretKey);

        request.user = {
            user_id: payload.user_id,
            email: payload.email,
            username: payload.username,
            displayname: payload.displayname ?? payload.username,
        };
        
    } catch (error) {
        throw new ApiError(401, "Invalid authentication token");
    }
};