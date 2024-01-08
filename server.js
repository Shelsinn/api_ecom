// Chargement des variables d'environnement.
require('dotenv').config();

// Import des modules nécessaires.
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Import des routes pour l'authentification.


// Import de la configuration de la BDD.


// Initialisation de l'application Express.
const app = express();

// Middleware pour traiter les requêtes JSON.
app.use(express.json());

// Middleware pour parser les cors de requêtes.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Utilisation des routes pour l'authentification.


// Middleware pour gérer les cors.
app.use(cors(corsOptions));

// Configuration des options cors.
const corsOptions = {
    credentials: true,
    optionsSuccessStatus: 200,
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    preflightContinue: false,
};

// Définition du port de démarrage du serveur.
const PORT = process.env.PORT || 5200;

// Fonction pour démarrer le serveur.
const start = async () => {
    try {
        // Connexion à la BDD.
        // Démarrage du serveur sur le port spécifié.
        app.listen(PORT, () => console.log(`Le serveur a démarré sur le port ${PORT}.`));

    } catch (error) {
        console.log(error);
    }
}
// Appel de la fonction pour démarrer le serveur.
start();