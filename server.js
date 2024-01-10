// Chargement des variables d'environnement.
require('dotenv').config();

// Import des modules nécessaires.
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Import des routes pour l'authentification.
const authRoutes = require('./routes/auth.route');

// Import des routes pour la création des produits.
const productRoutes = require('./routes/product.route');

// Import de la configuration de la BDD.
const connectDB = require('./config/db');

// Initialisation de l'application Express.
const app = express();

// Middleware pour traiter les requêtes JSON.
app.use(express.json());

// Middleware pour parser les cors de requêtes.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Utilisation des routes pour l'authentification.
app.use('/api', authRoutes);

// Utilisation des routes pour la création de produits.
app.use('/api', productRoutes);

// Configuration des options cors.
const corsOptions = {
	credentials: true,
	optionsSuccessStatus: 200,
	methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
	preflightContinue: false,
};

// Middleware pour gérer les cors.
app.use(cors(corsOptions));

// Définition du port de démarrage du serveur.
const PORT = process.env.PORT || 5200;

// Fonction pour démarrer le serveur.
const start = async () => {
	try {
		// Connexion à la BDD.
		await connectDB();
		console.log('Connexion à la BDD réussie.');
		// Démarrage du serveur sur le port spécifié.
		app.listen(PORT, () => console.log(`Le serveur a démarré sur le port ${PORT}.`));
	} catch (error) {
		console.log(error);
	}
};
// Appel de la fonction pour démarrer le serveur.
start();
