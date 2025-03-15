const jwt = require('jsonwebtoken');

const authentication = (req, res, next) => {
    const token = req.header("Authorization")
    if (!token) {
        res.status(401).send({ message: "Access denied. No token provided." })
    }
    const decoded = jwt .verify(token .replace("Bearer",""), process.env.SECRET_KEY)
    req.user = decoded
    next() // continue traitement de requeste
    }
 module.exports=authentication
