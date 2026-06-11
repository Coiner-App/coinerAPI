import { ObjectId, type WithId } from 'mongodb';
import type { UserBase, UserCoinPortfolioType, UserResponse, UserType } from './user.schema.js';
import MongoCommunicator from '../../shared/utils/mongo.communicator.js';
import { Collections } from '../../shared/db.collections.js';

export default class UserRepository {
    private readonly userCollection = Collections.USERS;
    private readonly counterCollection = Collections.COUNTERS;

    constructor(private readonly mongo: MongoCommunicator) {}

    /**
     * converts the DTO UserType object a UserResponse suitable for protected (accessible only to the user himself) endpoints
     * @async
     * @param user - UserType of the user being converted
     * @returns A cleansed UserResponse
     */
    public static toProtected(user: UserType): UserResponse {
        const { _id, password, ...publicUser } = user;
        return {
            _id: _id.toString(),
            ...publicUser
        }
    }

    /**
     * finds a single user from the database collection and internal id given in parameters
     * @async
     * @param collectionName - the collection name for the mongodb
     * @param userid - the userid that we need to search for
     * @returns UserType or null depending on if the user exists
     */
    public async findById(userid: string | ObjectId): Promise<UserType | null> {
        return this.mongo.findById<UserType>(this.userCollection, userid);
    }

    /**
     * finds a single user from the database collection and the email given in parameters
     * @async
     * @param email - the email that we need to search for
     * @returns UserType or null depending on if the user exists
     */
    public async findByEmail(email: string): Promise<WithId<UserType> | null> {
        return this.mongo.findOne<UserType>(this.userCollection, { email });
    }

    /**
     * finds a single user from the database collection and the username given in parameters
     * @async
     * @param username - the username that we need to search for
     * @returns UserType or null depending on if the user exists
     */
    public async findByUsername(username: string): Promise<WithId<UserType> | null> {
        return this.mongo.findOne<UserType>(this.userCollection, { username });
    }

    /**
     * inserts a new user document into the users collection
     * @async
     * @param user - The user data object to be stored
     * @returns The ID of the newly created user document
     */
    public async createUser(user: UserBase): Promise<ObjectId> {
        return this.mongo.insert<UserBase>(this.userCollection, user);
    }

    /***
     * Gets the next incremental id in turn based on registered users
     * @async
     * @returns - returns a number thats free in the database for a next public id
     */
    public async getNextIncId(): Promise<number> {
        const result = await this.mongo.db.collection<{ _id: string; seq: number }>(this.counterCollection)
        .findOneAndUpdate(
            { _id: 'userId' },
            { $inc: { seq: 1 } },
            { returnDocument: 'after', upsert: true }
        );
        return result!.seq;
    }

    /**
     * Gets the users asset portfolio
     * @async
     * @returns - returns
     */
    public async getUserPortfolio(userid: string | ObjectId): Promise<UserCoinPortfolioType | null> {
        const user = await this.findById(userid);
        if (!user) return null;
        const portfolio: UserCoinPortfolioType = user.coins;
        return portfolio;
    }
}
