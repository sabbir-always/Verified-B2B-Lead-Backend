import jwt from 'jsonwebtoken';

export const isSignin = async (req, res, next) => {
    try {
        const token = req.headers.authorization && req.headers.authorization.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : null;
        if (!token) { return res.status(401).json({ success: false, message: 'Access Denied. Please Send Your Token' }) }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.auth = { _id: decoded._id };
        next();

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ success: false, message: 'Session expired. Please log in again' });
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ success: false, message: 'Invalid token. Please log in again' });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error in authentication middleware"
        });
    }
};