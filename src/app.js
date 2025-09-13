
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';
import adoptionsRouter from './routes/adoption.router.js';
import sessionsRouter from './routes/sessions.router.js';
import mocksRouter from './routes/mock.router.js';

import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerOptions from './swagger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;


const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'adoptme';

mongoose.connect(MONGO_URL, { dbName: DB_NAME })
    .then(() => console.log('✅ Mongo conectado'))
    .catch((err) => {
    console.error('❌ Error conectando a Mongo:', err.message);
    process.exit(1);
    });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/mocks', mocksRouter);
app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);
app.use('/api/adoptions', adoptionsRouter);
app.use('/api/sessions', sessionsRouter);

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));


if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
}

export default app;
