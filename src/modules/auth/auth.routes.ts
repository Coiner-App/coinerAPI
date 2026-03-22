import { type FastifyPluginAsync } from "fastify";
import { Type, type FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import type { Db } from 'mongodb'
import { LoginResponseSchema, LoginSchema, RefreshSchema, RegisterResponseSchema, RegisterSchema, VerifyInput, type LoginInput, type LoginResponse } from "./auth.schema.js";
import AuthController from "./auth.controller.js";
import MongoCommunicator from "../../shared/utils/mongo.communicator.js";
import EmailService from "../../shared/utils/email.service.js";
import UserRepository from "../user/user.repository.js";
import AuthRepository from "./auth.repository.js";

export const AuthRoutes: FastifyPluginAsyncTypebox = async (app, options) => {
    // Setup route-wide components
    const mongoCom = app.mongoCommunicator;
    
    // Repositories
    const userRepo = app.userRepository;
    const authRepo = new AuthRepository(mongoCom);

    // Controllers
    const authController = new AuthController(authRepo, userRepo, mongoCom, app.emailService);

    // Routes
    app.post('/login', {
        schema: {
            body: LoginSchema,
            response: { '2xx': LoginResponseSchema }
        }
    }, async (request, reply) => {
        const deviceHeader = request.headers['device-model'];
        const devicemodel = typeof deviceHeader === 'string' ? deviceHeader.substring(0, 50).replace(/[<>]/g, '') : null;
        const reqinfo = { ip: request.ip, useragent: request.headers["user-agent"] ?? "", devicemodel};
        const loginres: LoginResponse = await authController.login(request.body, reqinfo);
        reply.header("Set-Cookie", `refresh_token=${loginres.refresh_token}; HttpOnly; Secure; SameSite=Strict; Path=/auth/refresh; Max-Age=604800`);
        return reply.status(200).send(loginres);
    });

    app.post('/refresh',{
        schema: { body: RefreshSchema, response: { '2xx': LoginResponseSchema, '4xx': { code: Type.Integer(), message: Type.String() } } }
    }, async (request, reply) => {
        const cookieHeader = request.headers.cookie;
        let cookieToken: string | null = null;
        if (cookieHeader) {
            const matchstr: string = "refresh_token="
            const startIndex: number = cookieHeader.indexOf(matchstr);

            if (startIndex != -1) {
                const tokenStart = startIndex + matchstr.length;
                // the refresh token is 32 chars
                cookieToken = cookieHeader.substring(tokenStart, tokenStart + 32);
            }
        }
        const refresh_tkn = request.body.refresh_token ?? cookieToken;
        if (!refresh_tkn) return reply.code(401).send({ code: 401, message: "No refresh token in body or cookie!"});
        const controller = await authController.refreshAuthToken(refresh_tkn!);
        return controller;
    });

    app.post('/logout',{ 
        schema: { body: RefreshSchema }
    }, async (request, reply) => {
        const cookieHeader = request.headers.cookie;
        let cookieToken: string | null = null;
        if (cookieHeader) {
            const matchstr: string = "refresh_token="
            const startIndex: number = cookieHeader.indexOf(matchstr);

            if (startIndex != -1) {
                const tokenStart = startIndex + matchstr.length;
                // the refresh token is 32 chars
                cookieToken = cookieHeader.substring(tokenStart, tokenStart + 32);
            }
        }
        const refresh_tkn = request.body.refresh_token ?? cookieToken;
        if (!refresh_tkn) return reply.code(401).send({ code: 401, message: "No refresh token in body or cookie!"});
        const controller = await authController.killSession(refresh_tkn!);
        reply.header("Set-Cookie", `refresh_token=${refresh_tkn}; HttpOnly; Secure; SameSite=Strict; Path=/auth/refresh; Max-Age=0`);
        return controller;
    });

    app.post('/register', {
        schema: {
            body: RegisterSchema,
            response: { '2xx': RegisterResponseSchema }
        }
    }, async (request, reply) => {
        const controller = await authController.initiateRegister(request.body);
        return reply.status(controller.code).send(controller);
    });

    app.get('/verify', {
        schema: { querystring: VerifyInput }
    }, async (request, reply) => {
        const controller = await authController.verifyUser(request.query.token);
        return reply.status(controller.code).send(controller);
    });
}