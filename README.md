## Coiner API Documentation
- [Coin Info/Price](https://github.com/coiner-app/coinerAPI/README.md#coin-info)
- [Supported Coins](https://github.com/coiner-app/coinerAPI/README.md#supported-coins)
- [Register](https://github.com/coiner-app/coinerAPI/README.md#Register)
- [Login](https://github.com/coiner-app/coinerAPI/README.md#Login)
- [Verify](https://github.com/coiner-app/coinerAPI/README.md#Verify)
- [Forgot (password)](https://github.com/coiner-app/coinerAPI/README.md#Forgot)
- [Me](https://github.com/coiner-app/coinerAPI/README.md#profileMe)
- [Portfolio](https://github.com/coiner-app/coinerAPI/README.md#Portfolio)
- [Logout](https://github.com/coiner-app/coinerAPI/README.md#Logout)
- [Exchange](https://github.com/coiner-app/coinerAPI/README.md#Exchange)

### Coin Info
#### Description:
- Get the data of a coin for the app needs
#### Endpoint:
- /api/coin
#### Arguments: 
##### id:
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
