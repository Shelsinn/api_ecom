// Import mongoose.
const mongoose = require('mongoose');

// Import supertest.
const request = require('supertest');

// Import app.
const app = require('../server');

// Import model.
const authModel = require('../models/auth.model');

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

// Bloc de tests pour la route update-password.
describe('update-password route testing', () => {
	// Variable pour stocker le token.
	let resetPasswordToken;

	// Avant tous les tests, récupérer un utilisateur avec un token valide en BDD.
	beforeAll(async () => {
		const user = await authModel.findOne({
			email: 'statham.jason@gmail.com',
		});

		// Vérification de l'utilisateur.
		if (user) {
			resetPasswordToken = user.resetPasswordToken;
		}
	});

	// Test vérifiant que la route renvoie un code 400 si les mots de passe ne correspondent pas.
	it('Should return status code 400 if passwords do not match.', async () => {
		const response = await request(app).put(`/api/update-password/${resetPasswordToken}`).send({
			newPassword: 'newPassword',
			confirmNewPassword: 'DifferentPassword',
		});
		// Vérifie que la réponse attendue est 400.
		expect(response.status).toBe(400);
	});

	// Test vérifiant que la route renvoie un code 400 si le token est invalide.
	it('Should return status code 400 if token is invalid.', async () => {
		const response = await request(app).put('/api/update-password/invalid-token').send({
			newPassword: 'newPassword',
			confirmNewPassword: 'newPassword',
		});
		// Vérifie que la réponse attendue est 400.
		expect(response.status).toBe(400);
	});

	// Test vérifiant que la route renvoie un code 200.
	it('Should return status code 200 if password is successfuly updated.', async () => {
		// S'assurer que le resetPasswordToken est défini avant le test.
		console.log('Reset password token', resetPasswordToken);
		if (resetPasswordToken) {
			const response = await request(app)
				.put(`/api/update-password/${resetPasswordToken}`)
				.send({
					newPassword: 'newPassword',
					confirmNewPassword: 'newPassword',
				});
			// Vérifier que la réponse attendue est 200.
			console.log('Response', response.body);
			expect(response.status).toBe(200);
		}
	});
});
