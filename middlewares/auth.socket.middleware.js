const authSocketMiddleware = (socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error('Authentication error: no token provided'));
    }

    try {
        const decodedToken = jwt.verify(token, config.jwtSecret);
        socket.decodedToken = decodedToken;
        next();
    } catch (error) {
        return next(new Error('Authentication error: invalid token'));
    }
};

module.exports = { authSocketMiddleware }