import jwt from 'jsonwebtoken';

class Token {
    generateToken(payload: object): { accessToken: string; refreshToken: string } {
        const secretKeyAccessToken = process.env.JWT_ACCESS_TOKEN; 

        if (!secretKeyAccessToken) {
            throw new Error('JWT_ACCESS_TOKEN is not defined in the environment variables');
        }

        const secretKeyRefreshToken = process.env.JWT_REFRESH_TOKEN;

        if (!secretKeyRefreshToken) {
            throw new Error('JWT_REFRESH_TOKEN is not defined in the environment variables');
        }

        const accessToken = jwt.sign(payload, secretKeyAccessToken, { expiresIn: '1h' });
        const refreshToken = jwt.sign(payload, secretKeyRefreshToken, { expiresIn: '7d' });

        return {
            accessToken,
            refreshToken,
        };
    }

    verifyAccessToken(token: string): any {
        const secretKeyAccessToken = process.env.JWT_ACCESS_TOKEN;

        if (!secretKeyAccessToken) {
            throw new Error('JWT_ACCESS_TOKEN is not defined in the environment variables');
        }

        try {
            return jwt.verify(token, secretKeyAccessToken);
        } catch (error) {
            console.error('Error verifying access token:', error);
            return null;
        }
    }

    verifyRefreshToken(token: string): any {
        const secretKeyRefreshToken = process.env.JWT_REFRESH_TOKEN;

        if (!secretKeyRefreshToken) {
            throw new Error('JWT_REFRESH_TOKEN is not defined in the environment variables');
        }

        try {
            return jwt.verify(token, secretKeyRefreshToken);
        } catch (error) {
            console.error('Error verifying refresh token:', error);
            return null;
        }
    }
    
}

export { Token }