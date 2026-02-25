import { ObjectId, type Db, type WithId } from 'mongodb';
import MongoCommunicator from '../../shared/utils/mongo.communicator.js';
import type { RegisterInput } from './auth.schema.js';

export interface PendingUser extends RegisterInput {
    createdAt: Date;
    verificationToken: string;
}

export default class AuthRepository {
    private readonly pendingCollection = 'pending_users';

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
}
