
import type { FastifyReply, FastifyRequest } from "fastify";
import * as jose from "jose";
import type { LoginInput, LoginResponse, RegisterInput, RegisterResponse, VerifyResponse } from "./auth.schema.js";
import AuthService from "./auth.service.js";
import { ObjectId, type Db } from "mongodb";
import MongoCommunicator from "../../shared/utils/mongo.communicator.js";
import EmailService from "../../shared/utils/email.service.js";
import AuthRepository, { type PendingUser } from "./auth.repository.js";
import UserRepository from "../user/user.repository.js";
import { ApiError } from "../../shared/errors.js";

export default class AuthController {
    constructor(private readonly authRepo: AuthRepository, private readonly userRepo: UserRepository,
        private readonly db: MongoCommunicator, private readonly emailService: EmailService) {}
    
    /**
     * Logs in the user and returns a jwt token
     */
    public async login(request: LoginInput, db: Db): Promise<LoginResponse> {
        if ('username' in request) {
            const username = request.username;
        } else {
            const email = request.email;
        }
        const password = request.password; 


        // verify user exists, verify password, sign tokens, bla bla
    }

    private async loginByUsername(username: string, password: string) {
        const user = await this.userRepo.findByUsername(username);
        if (!user) throw new ApiError(401, 'User not found.');
        
    }

    public async initiateRegister(request: RegisterInput): Promise<RegisterResponse> {
        const username = request.username;
        const displayname = request.displayname ?? username;
        const email = request.email;
        const password = request.password;

        /// Susceptible to race conditions ///
        // Verify user doesnt already exist
        if (await this.userRepo.findByEmail(email)) return { code: 409, message: 'Email already in use.' };
        if (await this.userRepo.findByUsername(username)) return { code: 409, message: 'Username already in use.'}
        // Verify user doesn't already have a code sent
        if (await this.authRepo.findPendingByEmail(email)) return { code: 409, message: 'Registration already in progress.' }

        const salt = await AuthService.saltPassword(password);
        const verificationToken = await AuthService.generateVerificationKey();

        const pendingusr: PendingUser = {
            displayname,
            username,
            email,
            password: salt,
            createdAt: new Date(),
            verificationToken
        };

        try {
            await this.authRepo.createPendingUser(pendingusr);
        } catch (error: any) {
            if (error.code === 11000) {
                return { code: 409, message: 'Registration already in progress.' };
            }
            throw error;
        }

        await this.emailService.sendVerificationMail(pendingusr.email, `http://localhost:8000/auth/verify?token=${verificationToken}`);
        return { code: 200, message: `Verification mail sent to ${pendingusr.email}` };
    }

    public async verifyUser(token: string): Promise<VerifyResponse> {
        const pendingUser = await this.authRepo.consumePendingUser(token);
        if (!pendingUser) return { code: 404, message: "Verification link invalid or expired.", user_id: "-1" };
        try {
            const user = await this.userRepo.createUser({
                publicid: await this.userRepo.getNextIncId(),
                username: pendingUser.username,
                displayname: pendingUser.displayname ?? pendingUser.username,
                email: pendingUser.email,
                password: pendingUser.password,
                coins: {
                    USDT: 100,
                    BTC: 0,
                    ETH: 0,
                    DOGE: 0
                },
                private: true,
                privatemail: true,
                verified: false
            });
            return { code: 201, message: "Registered successfully", user_id: user instanceof ObjectId ? user.toString() : user}
        } catch (error: any) {
            if (error.code === 11000) {
                return { code: 409, message: 'User already exists!', user_id: "-1" };
            }
            throw error;
        }
    }
}