import autoBind from 'auto-bind';

import type { Request, Response } from 'express';
import { Token } from '../../tokenize/Token.ts';

class UsersHandler {
    private _userService: any;
    private _registerUserValidator: any;
    private _loginUserValidator: any;
    private _manageToken: Token;

    constructor(userService: any, registerUserValidator: any, loginUserValidator: any) {
        this._userService = userService;
        this._registerUserValidator = registerUserValidator;
        this._loginUserValidator = loginUserValidator;
        this._manageToken = new Token();
        autoBind(this);
    }

    async postUserHandler(req: Request, res: Response) {
        try {
            this._registerUserValidator.validateUserPayload(req.body);
            const { name, email, password } = req.body;
            console.log('Request body:', req.body);
            const newUser = await this._userService.createUser({ name, email, password });
            
            return res.status(201).json({
                status: 'success',
                message: 'User created successfully',
                data: {
                    user: newUser,
                },
            });
        } catch (error: any) {
            const message =
            error instanceof Error
                ? error.message
                : 'Unknown error';

            return res.status(400).json({
                status: 'fail', 
                message: `Failed to create user: ${message}`,
            });
        }
    }

    async loginUserHandler(req: Request, res: Response) {
        try {
            this._loginUserValidator.validateLoginPayload(req.body);
            const { email, password } = req.body;
            const user = await this._userService.verifyCredentials(email, password);
            console.log('User after verifying credentials:', user);

            const tokens = this._manageToken.generateToken({ id: user.id, email: user.email });

            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            res.cookie('accessToken', tokens.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 1 * 60 * 60 * 1000, // 1 hour
            });

            const { password: _, ...userWithoutPassword } = user;

            return res.status(200).json({
                status: 'success',
                message: 'User logged in successfully',
                data: {
                    user: userWithoutPassword,
                    accessToken: tokens.accessToken,
                },
            });
            
        }catch (error: any) {
            const message =
            error instanceof Error
                ? error.message
                : 'Unknown error';

            return res.status(400).json({
                status: 'fail', 
                message: `Failed to login user: ${message}`,
            });
        }
    }

    async refreshTokenHandler(req: Request, res: Response) {
        try {
            const refreshToken = req.cookies['refreshToken'];

            console.log('Refresh token from cookies:', refreshToken);

            if (!refreshToken) {
                return res.status(401).json({
                    status: 'fail',
                    message: 'Refresh token not provided',
                });
            }

            const decoded = this._manageToken.verifyRefreshToken(refreshToken);

            if (!decoded) {
                return res.status(401).json({
                    status: 'fail',
                    message: 'Invalid refresh token',
                });
            }

            const newTokens = this._manageToken.generateToken({ id: decoded.id, email: decoded.email });

            res.cookie('accessToken', newTokens.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 1 * 60 * 60 * 1000, // 1 hour
            });

            return res.status(200).json({
                status: 'success',
                message: 'Token refreshed successfully',
                data: {
                    accessToken: newTokens.accessToken,
                },
            });
        } catch (error: any) {
            const message =
            error instanceof Error
                ? error.message
                : 'Unknown error';

            return res.status(400).json({
                status: 'fail', 
                message: `Failed to refresh token: ${message}`,
            });
        }
    }

    async logoutUserHandler(req: Request, res: Response) {
        try {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });

            res.clearCookie('accessToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });

            return res.status(200).json({
                status: 'success',
                message: 'User logged out successfully',
            });
        } catch (error: any) {
            const message =
            error instanceof Error
                ? error.message
                : 'Unknown error';

            return res.status(400).json({
                status: 'fail', 
                message: `Failed to logout user: ${message}`,
            });
        }
    }
}

export { UsersHandler };