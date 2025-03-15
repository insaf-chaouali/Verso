const express = require('express');
const router = express.Router();
const User = require('../models/User');// Route pour la recherche de professionnels
router.get('/search-professionals', async (req, res) => {
    const { job } = req.query;

    if (!job) {
        return res.status(400).json({ message: 'Veuillez fournir un métier pour la recherche.' });
    }

    const query = { 
        role: 'professionnel',
        job: { $regex: job, $options: 'i' }
    };

    try {
        const professionals = await User.find(query);
        if (professionals.length === 0) {
            return res.status(404).json({ message: 'Aucun professionnel trouvé pour ce métier.' });
        }
        res.json(professionals);
    } catch (error) {
        console.error('Erreur lors de la recherche :', error);
        res.status(500).json({ message: 'Erreur lors de la recherche', error });
    }
});

module.exports = router;