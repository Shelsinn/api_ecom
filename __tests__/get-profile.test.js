// Import mongoose.
const mongoose = require('mongoose');

// Import supertest.
const request = require('supertest');

// Import app.
const app = require('../server');

// Bloc de tests pour la route profile.
describe('user-side profile route testing', () => {
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
	// Test vérifiant que la route /api/profile/:id renvoie le profil de l'utilisateur connecté. (connexion)
	it("Should return authenticated user's profile", async () => {
		// Effectuer la connexion et récupérer le token.
		const loginResponse = await request(app).post('/api/login').send({
			email: 'statham.jason@gmail.com',
			password: 'newPassword',
		});
		// Vérifier que la connexion est réussie.
		expect(loginResponse.status).toBe(200);
		expect(loginResponse.body).toHaveProperty('token');

		// Récupérer le token pour le test suivant.
		const authToken = loginResponse.body.token;

		// Déclaration de variable utilisateur avec son id.
		const userId = '65ae4769139d0bf551d9c616';

		// Test pour vérifier que la route /api/profile/:id renvoie le profil de l'utilisateur connecté.
		const responseProfile = await request(app)
			.get(`/api/profile/${userId}`)
			.set('Authorization', `Bearer ${authToken}`);

		// Vérifier que la réponse est réussie.
		expect(responseProfile.status).toBe(200);

		// Afficher l'utilisateur dans la console.
		console.log('Utilisateur récupéré: ', responseProfile.body.existingUser);
	});
});
