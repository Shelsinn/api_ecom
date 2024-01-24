// Import mongoose.
const mongoose = require('mongoose');

// Import supertest.
const request = require('supertest');

// Import app.
const app = require('../server');

// Import JWT.
const jwt = require('jsonwebtoken');

// Import model.
const authModel = require('../models/auth.model');

// Fonction utilitaire pour générer un token d'authentification.
function generateAuthToken(userId, role) {
	const secretKey = process.env.JWT_SECRET;
	const expiresIn = '1h';

	// Utilisation de jwt pour générer le token.
	return jwt.sign({ user: { id: userId }, role }, secretKey, { expiresIn });
}

// Connexion à la BDD avant exécution des tests.
beforeAll(async () => {
	// Utilisation de la méthode connect de mongoose.
	await mongoose.connect(process.env.MONGO_URI);
	// Attente d'une seconde pour assurer la connexion à la BDD.
	await new Promise((resolve) => setTimeout(resolve, 1000));
});

// Fermeture de la connexion une fois les tests réalisés.
afterAll(async () => {
	// Utilisation de la méthode close de mongoose pour fermer la connexion.
	await mongoose.connection.close();
});

// Bloc de test pour vérifier si on peut accéder au dashboard en tant qu'admin.
describe('dashboard route testing', () => {
	it('Should allow acces to the dashboard for admins only', async () => {
		// ID de l'user admin dans la BDD.
		const adminUserId = '65a93e44b417ac4109f6ef2e';

		// Générer un token pour l'admin.
		const authToken = generateAuthToken(adminUserId, 'admin');

		// Faire la demande pour accéder au dashboard.
		const response = await request(app)
			.get('/api/dashboard')
			.set('Authorization', `Bearer ${authToken}`);

		// Log de la réponse.
		console.log(response.body);

		// S'assurer de la réussite de la demande.
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('message', 'Bienvenue Admin');
	});

	// Test si l'utilisateur n'a pas le rôle admin.
	it('Should return an error if the user trying to reach the dashboard is not an admin', async () => {
		// Id d'un utilisateur non admin dans la BDD.
		const nonAdminUserId = '65ae4769139d0bf551d9c616';

		// Génération d'un token.
		const authToken = generateAuthToken(nonAdminUserId, 'user');

		// Faire la demande pour accéder au dashboard.
		const response = await request(app)
			.get('/api/dashboard')
			.set('Authorization', `Bearer ${authToken}`);

		// Log de la réponse.
		console.log(response.body);

		// S'assurer que la réponse est un 403.
		expect(response.status).toBe(403);
		expect(response.body).toHaveProperty(
			'message',
			'Action non autorisée, seuls les admins peuvent accéder à cette page.'
		);
	});
});
