import jwt from 'jsonwebtoken';

const authMiddleware = (req: any, res: any, next: any) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json({
            status: 'fail',
            message: 'Access token not provided',
        });
    }

    const secretKeyAccessToken = process.env.JWT_ACCESS_TOKEN;

    if (!secretKeyAccessToken) {
        throw new Error('JWT_ACCESS_TOKEN is not defined in the environment variables');
    }

    try {
        const decoded = jwt.verify(accessToken, secretKeyAccessToken);
        req.user = decoded; 
        next(); 
    } catch (error) {
        console.error('Error verifying access token:', error);
        return res.status(401).json({
            status: 'fail',
            message: 'Invalid access token',
        });
    }
}

export { authMiddleware };