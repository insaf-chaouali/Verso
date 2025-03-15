const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET;

function isAuthenticated(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(403).json({ message: "Aucun token fourni, veuillez vous connecter et fournir un token valide" });
    }

    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Token invalide ou expiré" });
        }
        req.user = decoded;
        next();
    });
}

module.exports = isAuthenticated;