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

// Mock de la méthode destroy de cloudinary pour éviter de supprimer réellement les fichiers lors des tests.
jest.mock('cloudinary');

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

// Fonction utilitaire pour générer un token d'authentification.
function generateAuthToken(user) {
	const secretKey = process.env.JWT_SECRET;
	const expiresIn = '1h';

	// Utilisation de jwt pour générer le token.
	return jwt.sign({ userId: user._id }, secretKey, { expiresIn });
}

// Bloc de test pour la route de mise à jour du profil.
describe('update profile route testing', () => {
	it("Should update user's profile", async () => {
		// Entrer l'utilisateur existant en base de données (id).
		const existingUserId = '65ae4769139d0bf551d9c616';
		const existingUser = await authModel.findById(existingUserId);

		expect(existingUser).toBeDefined();

		// Générer un token.
		const authToken = generateAuthToken(existingUser);

		// Utiliser supertest pour envoyer une requête PUT.
		const response = await request(app)
			.put(`/api/update/${existingUserId}`)
			.set('Authorization', `Bearer ${authToken}`)
			.send({
				lastname: 'Van Damme',
				firstname: 'Jean-Claude',
				birthday: '15/07/1965',
				address: '54 rue du grand écart',
				zipcode: '78632',
				city: 'Awareville',
				phone: '0707070707',
				email: 'jcvd@gmail.com',
			});
		// Afficher le corps de la réponse en cas d'échec.
		if (response.status !== 200) {
			console.error(response.body);
		}

		// S'assurer que la réponse est 200.
		expect(response.status).toBe(200);
		// expect(response.body).toHaveProperty('message', 'Profil modifié avec succès: ', user: existingUser);
		expect(response.body).toHaveProperty('user');
	});
});
