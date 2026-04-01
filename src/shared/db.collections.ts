export const Collections = {
    USERS: 'users',
    PENDING_USERS: 'pending_users',
    SESSIONS: 'sessions',
    COUNTERS: 'counters',
    TRANSACTIONS: 'transactions'
} as const;

export type CollectionName = typeof Collections[keyof typeof Collections];
