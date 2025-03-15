const express = require('express');
const router = express.Router();
const path = require('path');

const isAuthenticated = require('../middleware/isAuthenticated');
const hasRole = require('../middleware/hasRole');

// Route pour la page Professionnel
router.get("/Professionnel", isAuthenticated, hasRole('professionnel'), (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'professionnel.html'));
});

module.exports = router;