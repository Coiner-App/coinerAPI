# Coiner Backend API
## Main features
- Scalability: Stateless JWT architecture designed specifically for horizontal scaling and load balancing
- Speed: MongoDB, Fastify's schema based validation, TypeBox for generating schemas and inferred types from them
- Minimal API requests: in-ram (`Map`) caching for both crypto and fiat prices to eliminate rate limit bottlenecks
- Database Concurrency: Implements OCC and uses atomic MongoDB operations to prevent race conditions

## Stack
- Server Framework: NodeJS + Fastify
- Database: MongoDB (native driver)
- Validation: ajv (from fastify) + typebox
- Auth: jose + native node crypto argon2 hashing

## Deployment
- Clone the repository
- Rename .env.example to .env and fill the values
- ``npm install``
- ``npm run build``
- ``npm run start``

## Known issues
- The app currently uses standard javascript numbers leading to floating-point math inaccuracies. For production deployment, all math must be migrated to libraries with arbitrary-precision math, integer-based tiny units (`satoshi`), or MongoDB `Decimal128`.