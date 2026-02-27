import { Type, type Static } from 'typebox';

export const LoginSchema = Type.Intersect([
  Type.Object({
    password: Type.String({ minLength: 8, maxLength: 32 }),
  }),
  Type.Union([
    Type.Object({ email: Type.String({ format: 'email' }) }),
    Type.Object({ username: Type.String({ minLength: 3, maxLength: 16 }) })
  ])
]);

export type LoginInput = Static<typeof LoginSchema>;

export const RegisterSchema = Type.Object({
    username: Type.String({ pattern: "/^[a-z0-9_]{3,16}$/igm" }),
    displayname: Type.Optional(Type.String({ minLength: 3, maxLength: 32 })),
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 8, maxLength: 32 }),
});

export type RegisterInput = Static<typeof RegisterSchema>;

export const VerifyInput = Type.Object({
    token: Type.String()
});

export const LoginResponseSchema = Type.Object({
    user_id: Type.String(),
    access_token: Type.String(),
    refresh_token: Type.String(),
    expiresafter: Type.Integer(),
});

export type LoginResponse = Static<typeof LoginResponseSchema>;

export const RegisterResponseSchema = Type.Object({
    code: Type.Integer(),
    message: Type.Optional(Type.String()),
});

export type RegisterResponse = Static<typeof RegisterResponseSchema>;

export const VerifyResponse = Type.Object({
    user_id: Type.String(),
    code: Type.Integer(),
    message: Type.Optional(Type.String()),
});

export type VerifyResponse = Static<typeof VerifyResponse>;