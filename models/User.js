const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
    
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
    },
    password: { 
        type: String, 
        required: true, 
    },
    role: { 
        type: String, 
        enum: ['admin', 'client', 'professionnel'], 
        required: true 
    },
    dateOfBirth: { 
        type: Date 
    },
    status: { 
        type: String, 
        default: 'Actif',
        enum: ['Actif', 'Inactif', 'Suspendu']
    },
    cityAddress: { 
        type: String,
        default: 'Non spécifié'
    },
    job: { 
        type: String 
    },
    city:{
        type : String
    }
});

// Middleware pour hacher le mot de passe avant de sauvegarder l'utilisateur

const User = mongoose.model('User', userSchema);

module.exports = User;