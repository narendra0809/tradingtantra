import jwt from "jsonwebtoken";

const authenticateSocket = (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;

        if (!token) {
            return next(new Error("Authentication token missing"));
        }

        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    return next(new Error("Token expired, please reauthenticate"));
                }
                return next(new Error("Invalid token"));
            }

            // console.log('authenticate')
            socket.user = { id: decoded.userId };
            next();
        });
    } catch (error) {
        console.error("Socket Authentication Error:", error);
        next(new Error("Authentication failed"));
    }
};

export default authenticateSocket;
