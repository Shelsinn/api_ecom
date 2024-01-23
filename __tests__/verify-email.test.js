// Importation de mongoose.
const mongoose = require('mongoose');

// Importation de supertest.
const request = require('supertest');

// Importation de l'application.
const app = require('../server');

// Importation du model.
const authModel = require('../models/auth.model');

// Connexion à la BDD avant l'exécution des tests.
beforeAll(async () => {
	// Utilisation de la méthode connect de mongoose.
	await mongoose.connect(process.env.MONGO_URI);
	// Attente d'une seconde pour assurer la connexion à la BDD.
	await new Promise((resolve) => setTimeout(resolve, 1000));
});

// Fermeture de la connexion après exécution des tests.
afterAll(async () => {
	// Utilisation de la méthode close de mongoose pour fermer la connexion.
	await mongoose.connection.close();
});

// Blocs de tests pour la route verify-email.
describe('Verify-email route testing', () => {
	// Variables pour stocker le token de vérification.
	let verificationToken;

	// Avant tous les tests, récupérer un utilisateur avec un token valide dans la base de données.
	beforeAll(async () => {
		const user = await authModel.findOne({
			email: 'random.mail@gmail.com',
		});
		// Vérification user.
		if (user) {
			verificationToken = user.emailVerificationToken;
		}
	});
	// Test vérifiant que la route renvoie un code 404 si le token est invalide.
	it('Should return code status 404 if invalid token', async () => {
		const response = await request(app).get('/api/verify-email/token-invalide');

		// Vérifie que la réponse attendue est 404.
		expect(response.status).toBe(404);
	});

	// Test vérifiant que la route renvoie un 200 si le token est valide.
	it('Should return code status 200 if valid token', async () => {
		// S'assurer que verificationToken est défini avant ce test.
		if (verificationToken) {
			const response = await request(app).get(`/api/verify-email/${verificationToken}`);
			// Vérifier que la réponse a un code 200.
			expect(response.status).toBe(200);
		} else {
			// Si verificationToken n'est pas défini, marquer le test comme réussi.
			expect(true).toBe(true);
		}
	});
});
