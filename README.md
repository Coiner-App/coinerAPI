## Coiner API Documentation (!!INCOMPLETE!!)
- [Coin Info/Price](README.md#coin-info)
- [Supported Coins](README.md#supported-coins)
- [Register](README.md#Register)
- [Login](README.md#Login)
- [Verify](README.md#Verify)
- [Forgot (password)](README.md#Forgot)
- [Me](README.md#profileMe)
- [Portfolio](README.md#Portfolio)
- [Logout](README.md#Logout)
- [Exchange](README.md#Exchange)

> **ALL GET REQUESTS USE QUERY PARAMS FOR ARGUMENTS AND SENSITIVE DATA IN POST REQUESTESTS IS URL ENCODED IN BODY.**

> Endpoints with general example heading usually have all their arguments required, other functions will have example in arguments.

> Some endpoints have different outcomes depending on request type (GET/POST). That should be expicitly separated.

### Coin Info
#### Description:
- Get the data of a coin for the app needs
#### Endpoint:
- /api/coin
#### Arguments: 
##### id:
- **required**
- query param
- symbol of coin that is supported
- arrays supported
- example: GET /api/coin?id=BTC

result:
```js 
[
    {
        "cmcid": 1,
        "marketrank": 1,
        "name": "Bitcoin",
        "slug": "bitcoin",
        "shortname": "BTC",
        "description": "Bitcoin (BTC) is a cryptocurrency . Users are able to generate BTC through the process of mining. Bitcoin has a current supply of 19,003,512. The last known price of Bitcoin is 45,910.42198731 USD and is down -0.10 over the last 24 hours. It is currently trading on 9301 active market(s) with $34,093,542,644.99 traded over the last 24 hours. More information can be found at https://bitcoin.org/.",
        "pricedata": {
            "currency": "USD",
            "price": 45934.367049374385,
            "marketcap": 872914295435.1907,
            "change24h": -0.07356085,
            "change7d": -3.90468852,
            "change30d": 18.20185909
        },
        "socials": {
            "website": "https://bitcoin.org/"
        },
        "data-by": "https://coinmarketcap.com"
    },
]
```
> Output may be in subject to change

- example2: GET /api/coin?id=BTC,ETH

result2:
```js
[
    {
        "cmcid": 1,
        "marketrank": 1,
        "name": "Bitcoin",
        "slug": "bitcoin",
        "shortname": "BTC",
        "description": "Bitcoin (BTC) is a cryptocurrency . Users are able to generate BTC through the process of mining. Bitcoin has a current supply of 19,003,512. The last known price of Bitcoin is 45,910.42198731 USD and is down -0.10 over the last 24 hours. It is currently trading on 9301 active market(s) with $34,093,542,644.99 traded over the last 24 hours. More information can be found at https://bitcoin.org/.",
        "pricedata": {
            "currency": "USD",
            "price": 45934.367049374385,
            "marketcap": 872914295435.1907,
            "change24h": -0.07356085,
            "change7d": -3.90468852,
            "change30d": 18.20185909
        },
        "socials": {
            "website": "https://bitcoin.org/"
        },
        "data-by": "https://coinmarketcap.com"
    },
    {
        "cmcid": 1027,
        "marketrank": 2,
        "name": "Ethereum",
        "slug": "ethereum",
        "shortname": "ETH",
        "description": "Ethereum (ETH) is a cryptocurrency . Users are able to generate ETH through the process of mining. Ethereum has a current supply of 120,254,396.4365. The last known price of Ethereum is 3,453.26762348 USD and is down -0.10 over the last 24 hours. It is currently trading on 5614 active market(s) with $17,869,029,677.05 traded over the last 24 hours. More information can be found at https://www.ethereum.org/.",
        "pricedata": {
            "currency": "USD",
            "price": 3455.2561745063863,
            "marketcap": 415509745798.7554,
            "change24h": -0.07361922,
            "change7d": 0.12814442,
            "change30d": 31.37172975
        },
        "socials": {
            "website": "https://www.ethereum.org/"
        },
        "data-by": "https://coinmarketcap.com"
    }
]
```

### Supported coins
#### Description:
- Get all supported coin symbols by coiner
#### Endpoint:
- /api/supportedcoins
#### Arguments: 
##### None:
- example: GET /api/supportedcoins

result:
```js
[
    "USDT",
    "BTC",
    "ETH",
    "DOGE",
    "ADA"
]
```

### Register
#### Description:
- Basic endpoint for registering a user. Requires [verify](README.md#verify)
#### Endpoint:
- /auth/register
#### Arguments:
##### username:
- **required**
- **must be in body url encoded**
- gets verified with this regex: `/^[a-z0-9_]{3,16}$/igm`
##### email:
- **required**
- **must be in body url encoded**
- gets verified with this regex: `/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/`
##### password:
- **required**
- **must be in body url encoded**
- **sensitive data - must be sent ONLY over HTTPS**
- there is no general limitation to what the password can be, even special symbols are allowed (such as ~\\\`:"/<,.) and the server should handle it perfectly anyway as everything gets turned to random numbers anyway
#### General Example:
- POST /auth/register
- Body content type: www/x-url-encoded
- Body: username=safahd&email=lol@coiner.com&password:examplepass1234!!
- Result:
```js
{ code: 200, message: "Verify email sent to your email." }
```
> Usually the follow up should be the user getting a code on the email he entered and a prompt to enter the code should be on the client side.
