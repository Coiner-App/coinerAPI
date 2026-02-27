import { Db, MongoClient, ObjectId, type Document, type Filter, type OptionalUnlessRequiredId, type WithId, type WithoutId, type InferIdType, type DeleteOptions } from 'mongodb';
import type { UserType } from '../../modules/user/user.schema.js';

export default class MongoCommunicator {
    constructor(public readonly db: Db){};

    /**
     * Returns all documents in a collection
     * @async
     * @warning DO NOT USE FOR EXTREMELY LARGE COLLECTIONS! THEY WILL BE LOADED INTO RAM!
     * @param collectionName - The name of the collection that the documents will be searched in
     * @returns An array of documents from the collection
     */
    public async findAll<T extends Document>(collectionName: string): Promise<WithId<T>[]>{
        return this.db.collection<T>(collectionName).find().toArray();
    }

    /**
     * Finds multiple documents in a collection based on a filter, with support for pagination
     * @async
     * @param collectionName - The name of the collection to search in
     * @param filter - The MongoDB filter query to apply
     * @param limit - The maximum number of documents to return (default: 100)
     * @param skip - The number of documents to skip for pagination (default: 0)
     * @returns An array of documents matching the filter
     */

    public async findMany<T extends Document>(
        collectionName: string, 
        filter: Filter<T> = {}, 
        limit: number = 100,
        skip: number = 0
    ): Promise<WithId<T>[]> {
        return await this.db.collection<T>(collectionName).find(filter)
        .limit(limit)
        .skip(skip)
        .toArray();
    }

    /**
     * finds a single document from the database collection and query given in parameters
     * @async
     * @param collectionName - the collection name for the mongodb
     * @param query - the filter query to search for
     * @returns The document or null depending on if it exists
     */
    public async findOne<T extends Document>(collectionName: string, query: Filter<T>): Promise<WithId<T> | null> {
        return await this.db.collection<T>(collectionName).findOne(query);
    }

    /**
     * finds a single document from the database collection and internal id given in parameters
     * @async
     * @param collectionName - the collection name for the mongodb
     * @param id - the internal ObjectId or string id that we need to search for
     * @returns The document or null depending on if it exists
     */
    public async findById<T extends Document>(collectionName: string, id: InferIdType<T> | string): Promise<WithId<T> | null> {
        if (!ObjectId.isValid(id)) return null;
        const queryId = typeof id === 'string' ? new ObjectId(id) : id;
        return this.db.collection<T>(collectionName).findOne({ _id: queryId } as Filter<T>);
        // Typescript would not shut up about { _id: id } not matching the type Filter,
        // this is impossible so solve without casting our check object because T is a generic,
        // meaning typescript will never recognize that _id will have an exact type,
        // and the compiler cant resolve { _id: id } to the mapped type.
        // MICROSOOOOOOOOOOOOOOOFT
        // Luckily the cast is safe because _id is guaranteed to exist and we verify id
    }

    /**
     * inserts a single document into the database collection
     * @async
     * @param collectionName - the collection name for the mongodb
     * @param data - the document data to be inserted
     * @returns The insertedId of the new document
     */
    public async insert<T extends Document>(collectionName: string, data: OptionalUnlessRequiredId<T>) {
        const result = await this.db.collection<T>(collectionName).insertOne(data);
        return result.insertedId;
    }

    /**
     * Deletes a single document from the database collection based on its internal id
     * @async
     * @param collectionName - The name of the collection to delete from
     * @param id - The internal ObjectId or string id of the document to delete
     * @returns A boolean indicating if a document was deleted
     */
    public async deleteById<T extends Document>(collectionName: string, id: InferIdType<T> | string): Promise<boolean> {
        if (!ObjectId.isValid(id)) return false;
        const queryId = typeof id === 'string' ? new ObjectId(id) : id;
        const result = await this.db.collection<T>(collectionName).deleteOne({ _id: queryId } as Filter<T>);
        // Luckily the cast is safe because _id is guaranteed to exist and we verify id
        return result.deletedCount === 1;
    }

    /**
     * Deletes multiple documents from a collection based on a filter
     * @async
     * @param collectionName - The name of the collection to delete from
     * @param filter - The MongoDB filter query to match documents for deletion
     * @returns The number of documents deleted
     */
    public async deleteMany<T extends Document>(collectionName: string, filter: Filter<T>): Promise<number> {
        const result = await this.db.collection<T>(collectionName).deleteMany(filter);
        return result.deletedCount;
    }

    public async count<T extends Document>(collectionName: string, filter: Filter<T>): Promise<number> {
        return this.db.collection<T>(collectionName).countDocuments(filter);
    }
}