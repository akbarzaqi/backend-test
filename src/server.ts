import 'dotenv/config';
import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { usersRouter } from './api/users/routeUsers.ts';
import { itemsRouter } from './api/items/routeItems.ts';

const app: Express = express();
app.use(cors({
    origin: true,
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api', usersRouter);
app.use('/api', itemsRouter);


app.listen(3000);