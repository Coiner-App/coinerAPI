import { type FastifyPluginAsync } from "fastify";
import { Type, type FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import type { Db } from 'mongodb'
import { LoginResponseSchema, LoginSchema, RegisterResponseSchema, RegisterSchema, VerifyInput, type LoginInput } from "./auth.schema.js";
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

    app.post<{ Body: LoginInput }>('/login', {
        schema: {
            body: LoginSchema,
            response: { '2xx': { type: 'object', data: LoginResponseSchema } }
        }
    }, async (request, reply) => {
        const controller = await authController.login(request.body, db);
        return controller;
    });
}