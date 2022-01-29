import mongoose from 'mongoose';

export const userSchema = new mongoose.Schema<iUser>({
    id: Number,
    displayname: String,
    username: String,
    email: String,
    password: String,
    coins: {
        USDT: Number,
        BTC: Number,
        ETH: Number,
        ADA: Number,
        DOGE: Number,
        FLD: Number,
    },
    private: Boolean,
    privatemail: Boolean,
    verified: Boolean,
});

export interface iUser {
    id: number,
    displayname: string,
    username: string,
    email: string,
    password: string,
    coins: {
        USDT: number,
        BTC: number,
        ETH: number,
        ADA: number,
        DOGE: number,
        FLD: number,
    },
    private: boolean,
    privatemail: boolean,
    verified: boolean,
}