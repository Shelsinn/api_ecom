// Import mongoose.
const mongoose = require('mongoose');

// Import supertest.
const request = require('supertest');

// Import app.
const app = require('../server');

// Import bcrypt.
const bcrypt = require('bcryptjs');

// Import JWT.
const jwt = require('jsonwebtoken');

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

// Bloc de tests pour la route de connexion.
describe('Login route testing', () => {
	// Test spécifique pour vérifier que la route renvoie un JWT en cas de connexion réussie.
	it('Should return a token if login is a success.', async () => {
		// On suppose que nous avons un utilisateur en BDD.
		const existingUser = {
			_id: new mongoose.Types.ObjectId(),
			email: 'statham.jason@gmail.com',
			// Hachage du mot de passe pour simuler le stockage en BDD.
			password: await bcrypt.hash('123456', 10),
		};
		// Simulation de la méthode findOne pour renvoyer l'utilisateur existant lorsqu'elle est appelée.
		jest.spyOn(authModel, 'findOne').mockResolvedValue(existingUser);

		// Effectuer la requête de connexion à la route /api/login.
		const response = await request(app).post('/api/login').send({
			email: 'statham.jason@gmail.com',
			// Fournir le mot de passe en clair pour la comparaison.
			password: '123456',
		});
		// Vérifier que la réponse est réussie.
		expect(response.status).toBe(200);

		// Vérifier que la réponse contient un jeton.
		expect(response.body).toHaveProperty('token');

		// Décoder le jeton pour vérifier son contenu.
		const decodedToken = jwt.verify(response.body.token, process.env.JWT_SECRET);

		// Vérifier que le jeton contient les infos attendues.
		expect(decodedToken).toHaveProperty('user');
		expect(decodedToken.user).toHaveProperty('id', existingUser._id.toHexString());
		expect(decodedToken.user).toHaveProperty('email', existingUser.email);
	});
});
