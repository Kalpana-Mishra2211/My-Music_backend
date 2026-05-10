import jwt from "jsonwebtoken"

const authArtist = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (decoded.role !== "artist") {
            return res.status(403).json({
                message: "You don't have access to create music",
            });
        }
        req.user=decoded;
        next()
    }
    catch (err) {
        return res.status(401).json({ message: "Unauthorized" });

    }
}

const authUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    // ✅ Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
         req.user=decoded;
        next()
    }
    catch (err) {
        return res.status(401).json({ message: "Unauthorized" });

    }
}

export {authArtist,authUser}