import { type FastifyPluginAsync } from "fastify";
import { Type, type FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import type { Db } from 'mongodb'
import { LoginResponseSchema, LoginSchema, RegisterResponseSchema, RegisterSchema, VerifyInput, type LoginInput, type LoginResponse } from "./auth.schema.js";
import AuthController from "./auth.controller.js";
import MongoCommunicator from "../../shared/utils/mongo.communicator.js";
import EmailService from "../../shared/utils/email.service.js";
import UserRepository from "../user/user.repository.js";
import AuthRepository from "./auth.repository.js";

export interface AuthRouteOptions {
    db: Db;
    emailSerivce: EmailService;
}

export const AuthRoutes: FastifyPluginAsyncTypebox<AuthRouteOptions> = async (app, options) => {
    // Setup route-wide components
    const db = options.db;
    const mongoCom = new MongoCommunicator(db);

    // Repositories
    const authRepo = new AuthRepository(mongoCom);
    const userRepo = new UserRepository(mongoCom);

    // Controllers
    const authController = new AuthController(authRepo, userRepo, mongoCom, options.emailSerivce);

    // Routes
    app.post('/login', {
        schema: {
            body: LoginSchema,
            response: { '2xx': { type: 'object', data: LoginResponseSchema } }
        }
    }, async (request, reply) => {
        const deviceHeader = request.headers['device-model'];
        const devicemodel = typeof deviceHeader === 'string' ? deviceHeader.substring(0, 50).replace(/[<>]/g, '') : null;
        const reqinfo = { ip: request.ip, useragent: request.headers["user-agent"] ?? "", devicemodel};
        const loginres: LoginResponse = await authController.login(request.body, reqinfo);
        reply.header("Set-Cookie", `refresh_token=${loginres.refresh_token}; HttpOnly; Secure; SameSite=Strict; Path=/auth/refresh; Max-Age=604800`);
        return reply.status(200).send(loginres);
    });

    app.post('/register', {
        schema: {
            body: RegisterSchema,
            response: { type: 'object', data: RegisterResponseSchema }
        }
    }, async (request, reply) => {
        const controller = await authController.initiateRegister(request.body);
        return reply.status(controller.code).send(controller);
    });

    app.get('/verify', {
        schema: {
            querystring: VerifyInput
        }
    }, async (request, reply) => {
        const controller = await authController.verifyUser(request.query.token);
        return reply.status(controller.code).send(controller);
    });
}