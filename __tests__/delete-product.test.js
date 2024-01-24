// Import mongoose.
const mongoose = require('mongoose');

// Import supertest.
const request = require('supertest');

// Import app.
const app = require('../server');

// Import JWT.
const jwt = require('jsonwebtoken');

// Import model.
const productModel = require('../models/product.model');

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

// Bloc de test pour effacer un produit par son ID.
describe('admin-side delete product by ID route testing', () => {
	// Test si l'utilisateur n'a pas le rôle admin.
	it('Should return an error if the user trying to delete is not an admin', async () => {
		// Id d'un utilisateur non admin dans la BDD.
		const nonAdminUserId = '65b10be38a1e5f46bd5bc552';

		// Id de l'utilisateur à update.
		const productIdToDelete = '65a677449874eafe4351fafe';

		// Génération d'un token.
		const authToken = generateAuthToken(nonAdminUserId);

		// Faire la demande pour delete.
		const response = await request(app)
			.delete(`/api/delete-product/${productIdToDelete}`)
			.set('Authorization', `Bearer ${authToken}`);

		// Log de la réponse.
		console.log(response.body);

		// S'assurer que la réponse est un 403.
		expect(response.status).toBe(403);
		expect(response.body).toHaveProperty(
			'message',
			'Action non autorisée. Seul un admin peut supprimer un produit.'
		);
	});

	// Test si l'utilisateur est admin.
	it('Should delete one product by its ID if user trying to do it is an admin.', async () => {
		// ID de l'user admin dans la BDD.
		const adminUserId = '65a93e44b417ac4109f6ef2e';

		// Id du produit à update.
		const productIdToDelete = '65b10cc9db013b03a6f45865';

		// Générer un token pour l'admin.
		const authToken = generateAuthToken(adminUserId);

		// Faire une demande pour delete.
		const response = await request(app)
			.delete(`/api/delete-product/${productIdToDelete}`)
			.set('Authorization', `Bearer ${authToken}`);

		// Log de la réponse.
		console.log(response.body);

		// S'assurer que la demande est réussie.
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('message', 'Produit supprimé avec succès.');

		// S'assurer que le produit a bien été supprimé.
		const deleteUser = await productModel.findById(productIdToDelete);
		expect(deleteUser).toBeNull();
	});
});
