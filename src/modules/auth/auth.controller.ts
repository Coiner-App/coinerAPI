import { ObjectId, type Db, type WithId } from "mongodb";
import * as jose from "jose";
import Bowser from "bowser";
import type { LoginInput, LoginResponse, RegisterInput, RegisterResponse, VerifyResponse } from "./auth.schema.js";
import AuthService from "./auth.service.js";
import MongoCommunicator from "../../shared/utils/mongo.communicator.js";
import EmailService from "../../shared/utils/email.service.js";
import AuthRepository, { type PendingUser, type UserSession } from "./auth.repository.js";
import UserRepository from "../user/user.repository.js";
import { ApiError } from "../../shared/errors.js";
import { config } from "../../config/env.js";
import type { UserType } from "../user/user.schema.js";

export default class AuthController {
    private readonly jwtSecret: Promise<CryptoKey | Uint8Array<ArrayBufferLike>>;
    constructor(private readonly authRepo: AuthRepository, private readonly userRepo: UserRepository,
        private readonly db: MongoCommunicator, private readonly emailService: EmailService) {
            this.jwtSecret = jose.importJWK(config.jwkSecret);
    }
    
    /**
     * Logs in the user and returns a jwt token
     */
    public async login(request: LoginInput, requestinfo: { ip: string, useragent: string, devicemodel: string | null }): Promise<LoginResponse> {
        let user: WithId<UserType>;
        if ('username' in request) {
            const username = request.username;
            user = await this.loginByUsername(username, request.password);
        } else {
            const email = request.email;
            user = await this.loginByEmail(email, request.password);
        }

        const user_id = user._id.toString();
        const access_tkn = {
            user_id,
            displayname: user.displayname,
            username: user.username,
            email: user.email,
        }
        // Setup the current session.
        const refresh_tkn: string = crypto.randomUUID().replace(/-/g, '');
        // I hate the javascript date class
        const session_expdate = new Date();
        session_expdate.setDate(session_expdate.getDate() + 7)
        const session_device = requestinfo.devicemodel ?? AuthService.getBrowserInfo(requestinfo.useragent);
        // interface based on the mongodb document
        const session_obj: UserSession = {
            _id: refresh_tkn,
            userId: user._id,
            ip: requestinfo.ip,
            device: session_device ?? "Unknown",
            createdAt: new Date(),
            expiresAt: session_expdate,
        }
        if ((await this.authRepo.countSessions(user._id)) >= 5) this.authRepo.deleteOldestSession(user._id);
        await this.authRepo.saveSession(session_obj);
        const access_jwt = await new jose.SignJWT(access_tkn)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('1h')
            .sign(await this.jwtSecret);
        
        return {
            user_id,
            access_token: access_jwt,
            refresh_token: refresh_tkn,
            expiresafter: 7 * 24 * 60 * 60, // week
        }
    }

    private async loginByUsername(username: string, password: string): Promise<WithId<UserType>> {
        const user = await this.userRepo.findByUsername(username);
        if (!user) throw new ApiError(401, 'User not found.');
        if (!await AuthService.checkPassword(password, user.password)) throw new ApiError(401, 'Invalid password.');
        return user;
    }

    private async loginByEmail(email: string, password: string): Promise<WithId<UserType>> {
        const user = await this.userRepo.findByEmail(email);
        if (!user) throw new ApiError(401, 'User not found.');
        if (!await AuthService.checkPassword(password, user.password)) throw new ApiError(401, 'Invalid password.');
        return user;
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