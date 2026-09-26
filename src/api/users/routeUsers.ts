import express from 'express';
import {usersHandler} from './index.ts';

const router = express.Router();

router.post('/users', usersHandler.postUserHandler);
router.post('/users/login', usersHandler.loginUserHandler);
router.post('/users/auth/refresh', usersHandler.refreshTokenHandler);
router.delete('/users/logout', usersHandler.logoutUserHandler);

export { router as usersRouter };
