import fastify from "fastify";

export async function buildApp() {
    const app = fastify({logger: true});

    app.get('/auth', async (request, reply) => {
        reply.send({ hello: 'world' });
    });

    return app;
}