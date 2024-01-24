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
	return jwt.sign({ userId, role }, secretKey, { expiresIn });
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

// Bloc de test pour récupérer tous les utilisateurs.
describe('delete user by ID route testing', () => {
	it('Should delete one user by its ID', async () => {
		// Id de l'utilisateur à supprimer.
		const userIdToDelete = '65afc49c53886f142ae51dd6';

		// Générer un token pour l'user
		const authToken = generateAuthToken(userIdToDelete);

		// Faire une demande pour supprimer.
		const response = await request(app)
			.delete(`/api/delete/${userIdToDelete}`)
			.set('Authorization', `Bearer ${authToken}`);

		// Log de la réponse.
		console.log(response.body);

		// S'assurer que la demande est réussie.
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('message', 'Utilisateur supprimé avec succès.');

		// S'assurer que les infos utilisateur ont bien été mises à jour.
		const deleteUser = await authModel.findById(userIdToDelete);
		expect(deleteUser).toBeNull();
	});
});
