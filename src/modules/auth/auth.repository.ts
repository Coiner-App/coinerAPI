import { ObjectId, type Db, type InferIdType, type WithId } from 'mongodb';
import MongoCommunicator from '../../shared/utils/mongo.communicator.js';
import type { RegisterInput } from './auth.schema.js';
import { Collections } from '../../shared/db.collections.js';

export interface PendingUser extends RegisterInput {
    createdAt: Date;
    verificationToken: string;
}

export interface UserSession {
    _id: string;
    userId: ObjectId;
    device: string;
    ip: string;
    createdAt: Date;
    expiresAt: Date;
}

export default class AuthRepository {
    private readonly pendingCollection = Collections.PENDING_USERS;
    private readonly authKeyCollection = Collections.SESSIONS;

    constructor(private readonly mongo: MongoCommunicator) {}

    /**
     * Stores a registration attempt in the pending users TTL collection
     * @async
     * @param data - PendingUser object that we will store in the db
     * @returns the ID of the inserted document
     */
    public async createPendingUser(data: PendingUser): Promise<string | ObjectId> {
        return this.mongo.insert<PendingUser>(this.pendingCollection, data);
    }

    /**
     * Finds a pending registration by the verification token
     * @async
     * @param token - The unique verification token sent to the user's email
     * @returns The pending user document or null if not found or expired
     */
    public async findPendingByToken(token: string): Promise<WithId<PendingUser> | null> {
        return this.mongo.findOne<PendingUser>(this.pendingCollection, { verificationToken: token });
    }

    /**
     * Finds a pending registration by the user's email address
     * @async
     * @param email - The email address to search for in the pending collection
     * @returns The pending user document or null if no registration is in progress
     */
    public async findPendingByEmail(email: string): Promise<WithId<PendingUser> | null> {
        return this.mongo.findOne<PendingUser>(this.pendingCollection, { email });
    }

    /**
     * Removes the pending user after successful verification
     * @async
     * @param token - The unique verification token to identify the document
     * @returns A boolean indicating if a document was deleted
     */
    public async deletePendingUser(token: string): Promise<boolean> {
        const result = await this.mongo.db.collection(this.pendingCollection).deleteOne({ verificationToken: token });
        return result.deletedCount > 0;
    }

    public async consumePendingUser(token: string): Promise<WithId<PendingUser> | null> {
        const user = await this.mongo.db.collection<PendingUser>(this.pendingCollection).findOneAndDelete({ verificationToken: token });
        return user ?? null;
    }

    // Session Storing and Handling //
    /**
     * Persists a new user session in the database
     * @async
     * @param user_id - The ObjectId of the user owning the session
     * @param session_obj - The session details including ID, device, and IP
     * @param expiration - The JS date object when the session should expire
     * @returns A boolean indicating if the session was successfully saved
     */
    public async saveSession(data: UserSession): Promise<boolean> {
        const result = await this.mongo.insert<UserSession>(this.authKeyCollection, data);
        return result ? false : true;
    }

    /**
     * Retrieves a specific session by its unique identifier
     * @async
     * @param refresh_tkn - The unique session ID (refresh token)
     * @returns The session document or null if not found
     */
    public async getSession(refresh_tkn: InferIdType<UserSession>): Promise<WithId<UserSession> | null> {
        return this.mongo.findOne<UserSession>(this.authKeyCollection, { _id: refresh_tkn });
    }

    /**
     * Retrieves all active sessions for a specific user
     * @async
     * @param user_id - The ObjectId of the user
     * @returns An array of session documents
     */
    public async getAllSessions(user_id: ObjectId): Promise<WithId<UserSession>[]> {
        return this.mongo.findMany<UserSession>(this.authKeyCollection, { userId: user_id });
    }

    public async countSessions(user_id: ObjectId): Promise<number> {
        return this.mongo.count<UserSession>(this.authKeyCollection, { userId: user_id });
    }

    /**
     * Deletes a specific session (logout from one device)
     * @async
     * @param refresh_tkn - The unique session ID to remove
     * @returns A boolean indicating if the deletion was successful
     */
    public async deleteSession(refresh_tkn: InferIdType<UserSession>): Promise<boolean> {
        const result = await this.mongo.deleteById<UserSession>(this.authKeyCollection, refresh_tkn);
        return result;
    }

    /**
     * Deletes all sessions associated with a user (logout from all devices)
     * @async
     * @param user_id - The ObjectId of the user
     * @returns A boolean indicating if the deletions were successful
     */
    public async deleteAllSessions(user_id: ObjectId) {
        const result = await this.mongo.deleteMany<UserSession>(this.authKeyCollection, { userId: user_id });
        return result;
    }

    /**
     * Deletes the oldest session for a user to enforce session limits
     * @async
     * @param user_id - The ObjectId of the user
     * @returns A boolean indicating if a session was deleted
     */
    public async deleteOldestSession(user_id: ObjectId): Promise<boolean> {
        const oldest = await this.mongo.db.collection(this.authKeyCollection)
            .findOneAndDelete({ userId: user_id }, { sort: { createdAt: 1 } });
        return oldest !== null;
    }
}
