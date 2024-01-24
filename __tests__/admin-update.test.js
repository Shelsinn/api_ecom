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
describe('admin-side update user by ID route testing', () => {
	it('Should update one user by its ID if user trying to get them is an admin.', async () => {
		// ID de l'user admin dans la BDD.
		const adminUserId = '65afc49c53886f142ae51dd6';

		// Id de l'utilisateur à update.
		const userIdToUpdate = '65ae4769139d0bf551d9c616';

		// Générer un token pour l'admin.
		const authToken = generateAuthToken(adminUserId);

		// Faire une demande pour update.
		const response = await request(app)
			.put(`/api/admin-update/${userIdToUpdate}`)
			.set('Authorization', `Bearer ${authToken}`)
			.send({
				lastname: 'VD',
				firstname: 'JC',
				birthday: '18/11/1955',
				address: '20 rue du grand écart',
				zipcode: '45879',
				city: 'Awarecity',
				phone: '0808080808',
				email: 'jcvd@gmail.fr',
			});

		// Log de la réponse.
		console.log(response.body);

		// S'assurer que la demande est réussie.
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('message', 'Profil modifié avec succès: ');
		expect(response.body).toHaveProperty('user');

		// S'assurer que les infos utilisateur ont bien été mises à jour.
		const updateUser = await authModel.findById(userIdToUpdate);
		expect(updateUser.lastname).toBe('VD');
		expect(updateUser.firstname).toBe('JC');
		expect(updateUser.birthday).toBe('18/11/1955');
		expect(updateUser.address).toBe('20 rue du grand écart');
		expect(updateUser.zipcode).toBe('45879');
		expect(updateUser.city).toBe('Awarecity');
		expect(updateUser.phone).toBe('0808080808');
		expect(updateUser.email).toBe('jcvd@gmail.fr');
	});

	// Test si l'utilisateur n'a pas le rôle admin.
	it('Should return an error if the user trying to reach the dashboard is not an admin', async () => {
		// Id d'un utilisateur non admin dans la BDD.
		const nonAdminUserId = '65ae4769139d0bf551d9c616';

		// Id de l'utilisateur à update.
		const userIdToUpdate = '65ae4769139d0bf551d9c616';

		// Génération d'un token.
		const authToken = generateAuthToken(nonAdminUserId);

		// Faire la demande pour update.
		const response = await request(app)
			.put(`/api/admin-update/${userIdToUpdate}`)
			.set('Authorization', `Bearer ${authToken}`)
			.send({
				lastname: 'VD',
				firstname: 'JC',
				birthday: '18/11/1955',
				address: '20 rue du grand écart',
				zipcode: '45879',
				city: 'Awarecity',
				phone: '0808080808',
				email: 'jcvd@gmail.fr',
			});

		// Log de la réponse.
		console.log(response.body);

		// S'assurer que la réponse est un 403.
		expect(response.status).toBe(403);
		expect(response.body).toHaveProperty(
			'message',
			'Action non autorisée. Seul un admin peut réaliser cette action.'
		);
	});
});
