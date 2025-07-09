const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const PORT = process.env.PORT || '3002';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    const start = Date.now();

    // Log when the request finishes
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(
            `${req.method} ${req.originalUrl} [${res.statusCode}] ${duration}ms`
        );
    });

    next();
});

app.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

/**
 * Routes
 */

app.get('/', (req, res) => {
    res.send('Hello World');
});

const casesRouter = require('./routes/cases');
app.use('/cases', casesRouter);

const adminRouter = require('./routes/cases_admin');
app.use('/admin', adminRouter);

const personsRouter = require('./routes/persons');
app.use('/persons', personsRouter);

const analyticsRouter = require('./routes/analytics');
app.use('/analytics', analyticsRouter);

// Start listening
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
