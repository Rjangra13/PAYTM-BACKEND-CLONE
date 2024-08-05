const { JWT_SECRET } = require("./config");
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    console.log("Authorization Header:", authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ msg: "Authorization header is missing." });
    }

    const token = authHeader.split(' ')[1];
    // console.log("Token:", token);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.userId) {
            req.userId = decoded.userId;
            next();
        } else {
            console.log("Invalid token payload.");
            return res.status(403).json({ msg: "Unauthorized person" });
        }
    } catch (error) {
        console.error("JWT verification error:", error);
        return res.status(403).json({ msg: "Unauthorized person" });
    }
};

module.exports = { authMiddleware };
