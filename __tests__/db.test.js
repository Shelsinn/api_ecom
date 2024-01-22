// Importation du module mongoose.
const mongoose = require('mongoose');

// Chargement des variables d'environnement.
require('dotenv').config();

// Connexion à la BDD avant l'exécution de tous les tests.
beforeAll(async () => {
	// Utilisation de la méthode connect de mongoose pour établir la connexion à la BDD.
	await mongoose.connect(process.env.MONGO_URI);
});

// Fermeture de la connexion à la BDD après exécution de tous les tests.
afterAll(async () => {
	// Utilisation de la méthode close de mongoose pour fermer la connexion à la BDD.
	await mongoose.connection.close();
});

// Test vérifiant que la connexion à la BDD est bien établie.
test('Should connect to the database.', async () => {
	// La propriété readyState de l'objet mongoose.connection est évaluée à 1 lorsque la connexion sera établie.
	const isConnected = mongoose.connection.readyState === 1;

	// Assertion vérifiant que la connexion à la BDD est bien établie.
	expect(isConnected).toBeTruthy();
});
