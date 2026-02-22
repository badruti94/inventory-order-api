import 'dotenv/config';

if(!process.env.JWT_SECRET){
    throw new Error('JWT_SECRET is required');
}

const env = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3000),
    logLevel: process.env.LOG_LEVEL ?? 'info',
    
    dbHost: process.env.DB_HOST ?? 'localhost',
    dbPort: Number(process.env.DB_PORT ?? 5432),
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    dbMaxPool: Number(process.env.DB_MAX_POOL ?? 10),

    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
    bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS ?? 10),
};

export default env;