import express from 'express';
import logger from './config/logger.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';
import { logInfo } from './utils/log.js';
import requestId from './middleware/requestId.js';
import productsRouter from './modules/products/products.route.js';

const app = express();


// Middleware dasar
app.use(express.json());
app.use(requestId);

// Request logger sederhana (nanti bisa upgrade pakai requestId)
app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const durationMs = Date.now - start;
        logInfo(req, 'HTTP Request', {
            statusCode: res.statusCode,
            durationMs,
        });
    });

    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({ ok: true });
});

// Simulasi error untuk ngetes centralized handler
app.get('/boom', (req, res) => {
    throw new Error('Boom!');
});

app.use('/products', productsRouter);

// 404 + error handler harus paling bawah
app.use(notFound);
app.use(errorHandler);

export default app;