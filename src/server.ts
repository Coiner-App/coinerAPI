import express from 'express';
import fs from 'fs';
import axios from 'axios';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import cookiesparser from 'cookie-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import * as jose from 'jose';
import { iUser, userSchema } from './interfaces/User.js';
import * as config from './config.json';
// initters
const app = express();
const currencies = JSON.parse(fs.readFileSync('currency-list.json', 'utf-8'));
const key = JSON.parse(fs.readFileSync('key.json', 'utf-8'));
const uri = `mongodb+srv://ender:${config.MONGODB_PASS}@cluster0.qenkt.mongodb.net/users?retryWrites=true&w=majority`;
/*const client = */mongoose.connect(uri);
const saltrounds: number = 10;
// global vars
var DEBUG: boolean = true;
var PRINTERROR: boolean = true;
// shit
// const supportedCoins: string[] = ["tether", "bitcoin", "ethereum", "dogecoin", "cardano", "FLD"];
// const geckoURL: string = "https://api.coingecko.com/api/v3/coins/";
let urlcodes = {};
let forgotcodes = {};
const supportedCoins = {
    "USDT": 825,
    "BTC": 1,
    "ETH": 1027,
    "DOGE": 74,
    "ADA": 2010,
}
const cmcURL: string = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/";
const cmcapikey: string = config.CMC_API_KEY;
// const cmcURL: string = "https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/";
// const cmcapikey: string = "b54bcf4d-1bca-4e8e-9a24-22ff2c3d462c";
const User = mongoose.model<iUser>('user', userSchema);
const emailverify = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const usernameverify = /^[a-z0-9_]{3,16}$/igm;
const jwtsignkey = jose.importJWK(key, 'HS256');
const testjwtsignkey = jose.importJWK({ kty: 'oct', k: 'FmsWMcfS8CmYyef91nDvyplUOIIE44O9os54H1_e7_o' }, 'HS256');

// Cronjobed
let crondata: Object = {};

// Setup SMTP
let transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
        user: config.SMTP_DETAILS.NAME,
        pass: config.SMTP_DETAILS.PASS,
    },
});
// Setup rate limit
const registerLimiter = rateLimit({
    windowMs: 1440 * 60 * 1000, // 24 hour window
    max: 3, // start blocking after 3 requests
    skipFailedRequests: true, // Skip failed
    message: { "error": "Too many register requests created.", "code": 429 }
});
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 100, // Block after 100
    skipSuccessfulRequests: true, // Skip successful
    message: { "error": "Too many login attempts. Try again after an hour", "code:": 429 }
})
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { "error": "Too many requests created.", "code": 429 }
});
const generalLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 1000,
    message: { "error": "Too many requests created.", "code": 429 }
});
const corsOptions = {
    origin: 'https://app.coinerapp.com',
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
/*const userSchema = new mongoose.Schema<iUser>({
    id: Number,
    username: String,
    email: String,
    password: String,
    coins: {
        USDT: Number,
        BTC: Number,
        ETH: Number,
        CRD: Number,
        DOGE: Number,
        FLD: Number,
    }
});*/

// format them jsons
app.set('json spaces', 4)
// CORS
app.use(cors(corsOptions));
// cookies
app.use(cookiesparser());
// static website
app.use(express.static('./public'));
//app.use("/app", express.static('./public-flutter'))
// urlencoded
app.use(express.urlencoded({ extended: true }));
// Limit api requests
app.use("/api/", limiter);
app.use("/profile/", generalLimiter);
app.use("/exchange/", generalLimiter)
// Middleware to secure /api/*
app.use(async function (req, res, next) {
    if (req.url.includes("/api")) {
        if (!req.cookies.user) return res.status(401).json({ code: 401, error: "Unauthorized" })
        const token = req.cookies.user;
        try {
            await jose.jwtVerify(token, await jwtsignkey, { maxTokenAge: "24h" });
        } catch (e) {
            return res.status(418).json({ code: 418, error: "not funny, did not laugh" });
        }
    }
    next();
});
var port = 8000; // TODO: Switch this to an actual port
app.listen(port, () => {
    cronjob();
    console.log("ready");
});

// fs.readdir("./classes/", (err, files) => {
//     if (err) return console.error(err);
//     files.forEach(file => {
//     let fileName = file.split(".")[0];
//       const gay = require(`./classes/${file}`);
//       client.on(eventName, event.bind(null, client));
//     });
// });

// Gecko-get
// app.get('/api/coin', (req, res) => {
//     if (!req.query.id) return res.status(400).json({ code: 400, error: "No gecko id" });
//     if (!supportedCoins.includes(req.query.id as string)) return res.status(400).json({ code: 400, error: "Unsupported coin by coiner" });
//     axios.get(geckoURL + req.query.id, {
//         params: {
//             ID: req.query.id,
//             localization: false,
//             tickers: false,
//             market_data: true,
//             community_data: false,
//             developer_data: false,
//             sparkline: false
//         }
//     }).then((response: { data: any; }) => {
//         const data = response.data;
//         let currency = () => {
//             const input = req.query.currency as string;
//             if (data.market_data.current_price[input])
//                 return input.toString();
//             else
//                 return "usd";
//         }
//         const price = data.market_data.current_price[currency()];
//         const formattedprice = price + currencies[currency().toUpperCase()].symbol;
//         const customdata = {
//             "geckoid": data.id,
//             "marketrank": data.market_data.market_cap_rank,
//             "name": data.name,
//             "shortname": data.symbol.toUpperCase(),
//             "description": "Test descriptino diaghufgfg",
//             "pngasset": data.image.large,
//             "pricedata": {
//                 "price": price,
//                 "formattedprice": formattedprice,
//                 "marketcap": data.market_data.market_cap[currency()],
//                 "currency": currencies[currency().toUpperCase()].symbol,
//                 "change24h": data.market_data.price_change_percentage_24h,
//                 "change7d": data.market_data.price_change_percentage_7d,
//                 "change30d": data.market_data.price_change_percentage_30d,
//                 "change1y": data.market_data.price_change_percentage_1y,
//                 "low24h": data.market_data.low_24h[currency()],
//                 "high24h": data.market_data.low_24h[currency()],
//             },
//             "socials": {
//                 "website": "www.coinerapp.com",
//             },
//             "data-by": "https://coingecko.com",
//         }
//         res.json(customdata);
//     }).catch((error: any) => {
//         if (PRINTERROR) console.error(error);
//         return res.status(400).json({ "code": 400, "error": error })
//     });
// });

// app.get('/api/coin', async (req, res) => {
//     if (!req.query.id) return res.status(400).json({ code: 400, error: "No crypto id" });
//     //if (!Object.keys(supportedCoins).includes(req.query.id as string)) return res.status(400).json({ code: 400, error: "Unsupported coin by coiner" });
//     const queries: string[] = (req.query.id as string).split(",");
//     let cmcids: string[] = [];
//     for (let i = 0; i < queries.length; i++) {
//         const s: string = queries[i];
//         if (!supportedCoins[s]) return res.status(400).json({ code: 400, error: "Unsupported coin by coiner" });
//         cmcids.push(supportedCoins[s]);
//     }
//     const response = await axios.get(cmcURL + 'quotes/latest', {
//         params: {
//             id: cmcids.join(','),
//             convert: req.query.currency,
//         },
//         headers: {
//             "X-CMC_PRO_API_KEY": cmcapikey,
//         }
//     });5
//     const metadatar = await axios.get(cmcURL + "info", {
//         params: {
//             id: cmcids.join(',')
//         },
//         headers: {
//             "X-CMC_PRO_API_KEY": cmcapikey,
//         },
//     });
//     const data = response.data.data;
//     const metadata = metadatar.data.data;
//     const status = response.data.status
//     const customdata: Object[] = [];
//     cmcids.forEach(cid => {
//         const currency: string = Object.keys(data[cid].quote)[0];
//         customdata.push({
//             "cmcid": data[cid].id,
//             "marketrank": data[cid].cmc_rank,
//             "name": data[cid].name,
//             "slug": data[cid].slug,
//             "shortname": data[cid].symbol.toUpperCase(),
//             "description": metadata[cid].description,
//             "pricedata": {
//                 "currency": currency,
//                 "price": data[cid].quote[currency].price,
//                 "marketcap": data[cid].quote[currency].market_cap,
//                 "change24h": data[cid].quote[currency].percent_change_24h,
//                 "change7d": data[cid].quote[currency].percent_change_7d,
//                 "change30d": data[cid].quote[currency].percent_change_30d,
//                 "change1y": data[cid].quote[currency].percent_change_1y,
//                 // "low24h": data.market_data.low_24h[currency()],
//                 // "high24h": data.market_data.low_24h[currency()],
//             },
//             "socials": {
//                 "website": metadata[cid].urls.website[0],
//             },
//             "data-by": "https://coinmarketcap.com",
//         });
//     });
//     res.json(customdata);
// });

app.get('/api/coin', async (req, res) => {
    if (!req.query.id) return res.status(400).json({ code: 400, error: "No crypto id" });
    const currency: string = req.query.currency as string ?? 'USD';
    const queries: string[] = (req.query.id as string).split(",");
    let cmcids: string[] = [];
    for (let i = 0; i < queries.length; i++) {
        const s: string = queries[i];
        if (!supportedCoins[s]) return res.status(400).json({ code: 400, error: "Unsupported coin by coiner" });
        cmcids.push(supportedCoins[s]);
    }
    const customdata: Object[] = [];
    const data = crondata[currency];
    cmcids.forEach(cid => {
        customdata.push(data[cid]);
    });
    res.json(customdata);
});

app.get('/api/supportedcoins', async (req, res) => {
    const supportedCoinSymbols = Object.keys(supportedCoins);
    res.json(supportedCoinSymbols);
});

app.post('/auth/register', registerLimiter, async (req, res) => {
    if (!req.body.username || !req.body.email || !req.body.password) return res.status(400).json({ "code": 400, "error": "Required fields missing" });
    const username: string = req.body.username;
    const usrnametest = await User.findOne({ username: username }).lean().exec();
    if (usrnametest) return res.status(409).json({ "code": 409, "error": "Username already used." });
    if (await !usernameverify.test(username)) return res.status(400).json({ "code": 400, "error": "Invalid username." });
    const displayname: string = req.body.dname ?? username;
    const email: string = req.body.email;
    const mailtest = await User.findOne({ email: email }).lean().exec();
    if (mailtest) return res.status(409).json({ "code": 409, "error": "Email already registered." });
    const urlkeys = Object.keys(urlcodes);
    // Object.keys(urlcodes).forEach(uniquecode => {
    //     if (urlcodes[uniquecode].email = email) {
    //         if (new Date(urlcodes[uniquecode].expiretime) > new Date()) res.status(409).json({ "code": 409, "error": "Email already has code sent to it." });
    //     } else {
    //         delete urlcodes[uniquecode];
    //     }
    // });
    for (let i = 0; i < urlkeys.length; i++) {
        const uniquecode = urlkeys[i];
        if (urlcodes[uniquecode].email = email) {
            if (new Date(urlcodes[uniquecode].expiretime) > new Date()) return res.status(409).json({ "code": 409, "error": "Email already has code sent to it." });
        } else {
            delete urlcodes[uniquecode];
        }
    }
    if (await !emailverify.test(email)) return res.status(400).json({ "code": 400, "error": "Invalid email." });
    const password: string = req.body.password;
    bcrypt.hash(password, saltrounds, async (err: any, hash: any) => {
        const uniquecode: string = crypto.randomBytes(16).toString("hex");
        const currdate = new Date();
        urlcodes[uniquecode] = {
            email: email,
            username: username.toLowerCase(),
            displayname: displayname,
            password: hash,
            expiretime: new Date(currdate.getTime() + 30 * 60000),
        };
        const finalurl = "https://" + req.hostname + "/auth/verify?id=" + uniquecode;
        await transporter.sendMail({
            from: '"Coiner Auth" <hamthrower7@outlook.com>', // sender address
            to: email, // list of receivers
            subject: "Coiner Email Verify", // Subject line
            text: "Link for register on coiner:\n" + finalurl + "\nThis code will expire in 30 minutes.\nDO NOT SHARE THIS LINK WITH ANYONE"
        }).then(result => {
            console.log("Message sent: %s", result);
            res.status(200).json({ code: 200, message: "Verify email sent to your email." });
        }).catch(err => {
            if (PRINTERROR) console.log(err);
            return res.status(500).json({ "code": 500, "error": "Something went wrong on our side, or yours, we really have no idea." })
        });
    });
});

app.get('/auth/verify', authLimiter, async (req, res) => {
    console.log(urlcodes)
    const lastid: number = await getLastId();
    if (!req.query.id) return res.status(400).json({ code: 400, error: "Missing signup code" });
    const uniquecode: string = req.query.id as string;
    if (!urlcodes[uniquecode]) return res.status(418).json({ code: 418, error: "Among us indeed" });
    if (new Date(urlcodes[uniquecode].expiretime) < new Date()) {
        // uh oh using an expired code, delete that shit
        delete urlcodes[uniquecode];
        return res.status(401).json({ error: "expired code", "code": 401 });
    }
    const displayname = urlcodes[uniquecode].displayname, username = urlcodes[uniquecode].username, email = urlcodes[uniquecode].email, hash = urlcodes[uniquecode].password;
    delete urlcodes[uniquecode];
    const newUser = new User({
        id: lastid + 1,
        displayname: displayname,
        username: username,
        email: email,
        password: hash,
        coins: {
            USDT: 100.0,
            BTC: 0.0,
            ETH: 0.0,
            ADA: 0.0,
            DOGE: 0.0,
            FLD: 0.0,
        },
        private: false,
        privatemail: true,
        verified: false,
    });
    newUser.save();
    res.status(201).redirect("/login.html");
});

app.post('/auth/login', authLimiter, async (req: any, res: any) => {
    console.log(req.body)
    if (!req.body.email || !req.body.password) return res.status(400).json({ code: 400, error: "Required fields missing" });
    const result = await User.findOne({ email: req.body.email }).lean().exec();
    if (result == null) return res.status(400).json({ code: 400, error: "Email not registered" });
    const passmatch = await bcrypt.compare(req.body.password, result.password);
    if (passmatch) {
        const jwt = await new jose.SignJWT({ id: result.id, username: result.username })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(await jwtsignkey);
        res.header('Set-Cookie', `user=${jwt}; Max-Age=86400; Path=/; httpOnly; SameSite=Lax; Domain=coinerapp.com;`);
        res.status(200).end();
    } else {
        res.status(403).json({ code: 403, error: "Wrong password" });
    }
});

app.get('/auth/forgot', registerLimiter, async (req, res) => {
    if (!req.query.email) return res.status(400).json({ code: 400, error: "Missing email." });
    const email: string = req.query.email as string;
    const forgotkeys = Object.keys(forgotcodes);
    for (let i = 0; i < forgotkeys.length; i++) {
        const uniquecode = forgotkeys[i];
        if (forgotcodes[uniquecode].email = email) {
            if (new Date(forgotcodes[uniquecode].expiretime) > new Date()) return res.status(409).json({ "code": 409, "error": "Email already has code sent to it." });
        } else {
            delete forgotcodes[uniquecode];
        }
    }
    const result = await User.findOne({ email: req.query.email }).lean().exec();
    if (!result) return res.status(400).json({ code: 400, error: "Email not registered" });
    const uniquecode: string = crypto.randomInt(10000, 99999).toString();
    const currdate = new Date();
    urlcodes[uniquecode] = {
        email: email,
        expiretime: new Date(currdate.getTime() + 30 * 60000),
    };
    console.log(uniquecode);
    await transporter.sendMail({
        from: '"Coiner Auth" <hamthrower7@outlook.com>', // sender address
        to: email, // list of receivers
        subject: "Coiner Password reset", // Subject line
        text: "Code for password reset on coiner:\n" + uniquecode + "\nThis code will expire in 30 minutes.\nDO NOT SHARE THIS CODE WITH ANYONE, if you DID NOT request this code, you can ignore it."
    }).then(result => {
        res.status(200).json({ code: 200, message: "Code email sent to your email." });
    }).catch(err => {
        if (PRINTERROR) console.error(err);
        return res.status(500).json({ "code": 500, "error": "Something went wrong on our side, or yours, we really have no idea." })
    });
});

app.post('/auth/forgot', async (req, res) => {
    if (!req.body.code) return res.status(400).json({ code: 400, error: "Missing code" });
    if (!req.body.newpass) return res.status(400).json({ code: 400, error: "Missing pass." });
    const uniquecode: string = req.body.code;
    const newpass: string = req.body.newpass;
    if (!urlcodes[uniquecode]) return res.status(418).json({ code: 418, error: "Wrong code" });
    if (new Date(urlcodes[uniquecode].expiretime) < new Date()) {
        // uh oh using an expired code, delete that shit
        delete urlcodes[uniquecode];
        return res.status(401).json({ error: "expired code", "code": 401 });
    }
    const email = urlcodes[uniquecode].email;
    const result = await User.findOne({ email: email }).exec();
    if (!result) return res.status(400).json({ code: 400, error: "Email not registered" });
    bcrypt.hash(newpass, saltrounds, async (err: any, hash: any) => {
        result.password = await hash;
        await result.save();
        await transporter.sendMail({
            from: '"Coiner Auth" <hamthrower7@outlook.com>', // sender address
            to: email, // list of receivers
            subject: "Coiner Password was reset", // Subject line
            text: "Your password was just reset, hopefully it was you, if it was not then secure your email address as fast as possible."
        }).then(result => {
            res.status(200).json({ code: 200, message: "Password was reset" });
        }).catch(err => {
            if (PRINTERROR) console.error(err);
            return res.status(200).end();
        });
    });
});

// app.get('/get/scammed', async (req, res) => {
//     const jwt = await new jose.SignJWT({ id: 0, username: "boger" })
//         .setProtectedHeader({ alg: 'HS256' })
//         .setIssuedAt()
//         .setExpirationTime('30m')
//         .sign(await testjwtsignkey);
//     res.header('Set-Cookie', `user=${jwt}; Max-Age=86400; Path=/; httpOnly; SameSite=Lax;`);
//     res.status(200).end();
// });

app.get('/profile/me', async (req, res) => {
    if (!req.cookies.user) return res.status(401).json({ code: 401, error: "Unauthorized" })
    const token = req.cookies.user;
    let jwtv: jose.JWTVerifyResult;
    try {
        jwtv = await jose.jwtVerify(token, await jwtsignkey, { maxTokenAge: "24h" });
    } catch (e) {
        return res.status(418).json({ code: 418, error: "not funny, did not laugh" });
    }
    const id = await jwtv.payload.id;
    const dbentry = await User.findOne({ id: id }).lean().exec();
    if (!dbentry) return res.status(400).json({ code: 418, error: "Account with such id no longer exists." });
    const cdata = {
        id: dbentry.id,
        displayname: dbentry.displayname,
        username: `@${dbentry.username}`,
        email: dbentry.email,
        isprivate: dbentry.private ?? false,
        privatemail: dbentry.privatemail ?? true,
        isverified: dbentry.verified ?? false,
    };
    res.status(200).json(cdata);
});

// app.get('/profile/portfolio', async (req, res) => {
//     if (!req.cookies.user) return res.status(401).json({ code: 401, error: "Unauthorized" });
//     //if (!req.query.currency) return res.status(400).json({ code: 400, error: "Currency query missing."});
//     const token = req.cookies.user;
//     let jwtv: jose.JWTVerifyResult;
//     try {
//         jwtv = await jose.jwtVerify(token, await jwtsignkey, { maxTokenAge: "24h" });
//     } catch (e) {
//         return res.status(418).json({ code: 418, error: "not funny, did not laugh" });
//     }
//     const id = await jwtv.payload.id;
//     const dbentry = await User.findOne({ id: id }).lean().exec();
//     if (!dbentry) return res.status(400).json({ code: 418, error: "Account with such id no longer exists." });
//     const coins = dbentry.coins;
//     let responsecoinids: Object[] = [];
//     Object.keys(coins).forEach(value => {
//         const coinvalue = Number.parseFloat(coins[value]);
//         //if(coinvalue > 0) responsecoinids.push(supportedCoins[value]);
//         if (coinvalue > 0) responsecoinids[supportedCoins[value]] = value;
//     });
//     const response = await axios.get(cmcURL + 'quotes/latest', {
//         params: {
//             id: Object.keys(responsecoinids).join(','),
//             convert: req.query.currency,
//         },
//         headers: {
//             "X-CMC_PRO_API_KEY": cmcapikey,
//         }
//     });
//     const data = response.data.data;
//     const status = response.data.status
//     const customdata: Object[] = [];
//     Object.keys(responsecoinids).forEach(cid => {
//         const symbol: string = responsecoinids[cid];
//         const currency: string = Object.keys(data[cid].quote)[0];
//         customdata.push({
//             "cmcid": data[cid].id,
//             "marketrank": data[cid].cmc_rank,
//             "name": data[cid].name,
//             "slug": data[cid].slug,
//             "shortname": data[cid].symbol.toUpperCase(),
//             "amount": Number.parseFloat(coins[symbol]),
//             "amountmoney": data[cid].quote[currency].price * Number.parseFloat(coins[symbol]),
//             "pricedata": {
//                 "currency": currency,
//                 "price": data[cid].quote[currency].price,
//                 "marketcap": data[cid].quote[currency].market_cap,
//                 "change24h": data[cid].quote[currency].percent_change_24h,
//                 "change7d": data[cid].quote[currency].percent_change_7d,
//                 "change30d": data[cid].quote[currency].percent_change_30d,
//                 "change1y": data[cid].quote[currency].percent_change_1y,
//             },
//             "data-by": "https://coinmarketcap.com",
//         });
//     });
//     res.json(customdata);
// });

app.get('/profile/portfolio', async (req, res) => {
    if (!req.cookies.user) return res.status(401).json({ code: 401, error: "Unauthorized" });
    //if (!req.query.currency) return res.status(400).json({ code: 400, error: "Currency query missing."});
    const token = req.cookies.user;
    let jwtv: jose.JWTVerifyResult;
    try {
        jwtv = await jose.jwtVerify(token, await jwtsignkey, { maxTokenAge: "24h" });
    } catch (e) {
        return res.status(418).json({ code: 418, error: "not funny, did not laugh" });
    }
    const id = await jwtv.payload.id;
    const dbentry = await User.findOne({ id: id }).lean().exec();
    if (!dbentry) return res.status(400).json({ code: 418, error: "Account with such id no longer exists." });
    const currency: string = req.query.currency as string ?? 'USD';
    const coins = dbentry.coins;
    let responsecoinids: Object[] = [];
    Object.keys(coins).forEach(value => {
        const coinvalue = Number.parseFloat(coins[value]);
        //if(coinvalue > 0) responsecoinids.push(supportedCoins[value]);
        if (coinvalue > 0) responsecoinids[supportedCoins[value]] = value;
    });
    //Object.keys(responsecoinids).join(',')
    const data = crondata[currency];
    const customdata: Object[] = [];
    Object.keys(responsecoinids).forEach(cid => {
        const symbol: string = responsecoinids[cid];
        customdata.push({
            "cmcid": data[cid].cmcid,
            "marketrank": data[cid].marketrank,
            "name": data[cid].name,
            "slug": data[cid].slug,
            "shortname": data[cid].shortname,
            "amount": Number.parseFloat(coins[symbol]),
            "amountmoney": data[cid].pricedata.price * Number.parseFloat(coins[symbol]),
            "pricedata": {
                "currency": data[cid].pricedata.currency,
                "price": data[cid].pricedata.price,
                "marketcap": data[cid].pricedata.marketcap,
                "change24h": data[cid].pricedata.change24h,
                "change7d": data[cid].pricedata.change7d,
                "change30d": data[cid].pricedata.change30d,
                "change1y": data[cid].pricedata.change1y,
            },
            "data-by": "https://coinmarketcap.com",
        });
    });
    res.json(customdata);
});

app.get('/profile/logout', async (req, res) => {
    res.header('Set-Cookie', `user=dead; Max-Age=-1; Path=/; httpOnly; SameSite=Lax; Domain=coinerapp.com`);
    res.status(200).end();
});

app.post('/profile/exchange', async (req, res) => {
    const from: string = req.body.from as string;
    const to: string = req.body.to as string;
    const amount: string = req.body.amount as string;
    const parsedamount = Number.parseFloat(amount);
    if (!from || !to || !amount) return res.status(400).json({ code: 400, error: "Missing required fields" });
    if (parsedamount <= 0) return res.status(406).json({ code: 406, error: "Amount to spend too little or negative" });
    if (!req.cookies.user) return res.status(401).json({ code: 401, error: "Unauthorized" });
    const token = req.cookies.user;
    let jwtv: jose.JWTVerifyResult;
    try {
        jwtv = await jose.jwtVerify(token, await jwtsignkey, { maxTokenAge: "24h" });
    } catch (e) {
        return res.status(418).json({ code: 418, error: "not funny, did not laugh" });
    }
    const id = await jwtv.payload.id;
    const dbentry = await User.findOne({ id: id }).exec();
    if (!dbentry) return res.status(400).json({ code: 418, error: "Account with such id no longer exists." });
    if (!Object.keys(supportedCoins).includes(from) || !Object.keys(supportedCoins).includes(to)) return res.status(400).json({ "code": 400, "error": "Unsupported coin for exchange" });
    if (parsedamount > dbentry.coins[from]) return res.status(406).json({ code: 406, error: "Amount to spend more than supply" });
    let response;
    const fromid = supportedCoins[from];
    const toid = supportedCoins[to];
    // try {
    //     response = await axios.get(cmcURL + 'quotes/latest', {
    //         params: {
    //             id: `${fromid},${toid}`,
    //             convert: 'USD',
    //         },
    //         headers: {
    //             "X-CMC_PRO_API_KEY": cmcapikey,
    //         }
    //     });
    // } catch {
    //     res.status(500).json({ code: 500, error: "Something went wrong server-side, please notify us." })
    // }
    // const pricefrom = await response.data.data[fromid].quote.USD.price;
    // const priceto = await response.data.data[toid].quote.USD.price;
    const pricefrom = crondata['USD'][fromid].pricedata.price;
    const priceto = crondata['USD'][toid].pricedata.price;
    const rate = (pricefrom * parsedamount) / priceto;
    const oldfrom = dbentry.coins[from];
    const oldto = dbentry.coins[to];
    dbentry.coins[from] = await dbentry.coins[from] - parsedamount;
    dbentry.coins[to] = await dbentry.coins[to] + rate;
    await dbentry.save();
    res.json({
        from: from,
        to: to,
        amount: parsedamount,
        oldamountfrom: oldfrom,
        oldamountto: oldto,
        finalamountfrom: dbentry.coins[from],
        finalamountto: dbentry.coins[to],
    });
});

app.get('/downloads/latest', async (req, res) => {
    if (!req.query.platform) return res.status(400).json({ code: 400, error: "No platform query" });
    const platform: string = req.query.platform as string;
    if (platform == "android") {
        res.redirect("https://link.eu1.storjshare.io/jxxwabrynqgsdogz43yucru4hwmq/coiner-packages%2Flatest.apk?download");
    }
})

const getLastId = async () => {
    const lastid = await User.find().sort({ id: -1 }).limit(1).exec();
    return lastid[0].id as number;
};

const getallcoins = async (currency: string) => {
    let cmcids: string[] = Object.values(supportedCoins).toString().split(',');
    const response = await axios.get(cmcURL + 'quotes/latest', {
        params: {
            id: cmcids.join(','),
            convert: currency,
        },
        headers: {
            "X-CMC_PRO_API_KEY": cmcapikey,
        }
    });
    const metadatar = await axios.get(cmcURL + "info", {
        params: {
            id: cmcids.join(',')
        },
        headers: {
            "X-CMC_PRO_API_KEY": cmcapikey,
        },
    });
    const data = response.data.data;
    const metadata = metadatar.data.data;
    const status = response.data.status
    const customdata: Object = {};
    cmcids.forEach(cid => {
        const currency: string = Object.keys(data[cid].quote)[0];
        customdata[cid] = {
            "cmcid": data[cid].id,
            "marketrank": data[cid].cmc_rank,
            "name": data[cid].name,
            "slug": data[cid].slug,
            "shortname": data[cid].symbol.toUpperCase(),
            "description": metadata[cid].description,
            "pricedata": {
                "currency": currency,
                "price": data[cid].quote[currency].price,
                "marketcap": data[cid].quote[currency].market_cap,
                "change24h": data[cid].quote[currency].percent_change_24h,
                "change7d": data[cid].quote[currency].percent_change_7d,
                "change30d": data[cid].quote[currency].percent_change_30d,
                "change1y": data[cid].quote[currency].percent_change_1y,
                // "low24h": data.market_data.low_24h[currency()],
                // "high24h": data.market_data.low_24h[currency()],
            },
            "socials": {
                "website": metadata[cid].urls.website[0],
            },
            "data-by": "https://coinmarketcap.com",
        };
    });
    crondata[currency] = customdata;
    const today = new Date();
    console.log(today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds());
}

async function cronjob() {
    await getallcoins('USD');
}

setInterval(cronjob, 3600000);

// const getLastIdSync = () => {
//     let finallastid;
//     User.find().sort({ id: -1 }).limit(1).exec((err, lastid) => {
//         finallastid = lastid[0].id as number;
//     });
//     return finallastid;
// };