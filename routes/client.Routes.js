const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/isAuthenticated');
const hasRole = require('../middleware/hasRole');

// Exemple de route pour les clients
router.get('/', isAuthenticated, hasRole('client'), (req, res) => {
    res.send('Bienvenue, client!');
});

module.exports = router;