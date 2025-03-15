function hasRole(role) {
    return (req, res, next) => {
        if (req.user && req.user.role === role) {
            return next();
        } else {
            res.status(403).json({ message: "Accès refusé : vous n'avez pas les permissions nécessaires" });
        }
    };
}

module.exports = hasRole;