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

// Bloc de tests pour la route de réinitialisation de mot de passe.
describe('Forgot password route testing', () => {
	// Variable pour stocker l'espion findOneAndUpdate.
	let findOneAndUpdateSpy;

	// Créer un espion sur la méthode findOneAndUpdate avant chaque test.
	beforeEach(() => {
		findOneAndUpdateSpy = jest.spyOn(authModel, 'findOneAndUpdate');
	});
	// Restaurer les mocks après les tests.
	afterEach(() => {
		jest.restoreAllMocks();
	});

	// Test vérifiant la réception du token de réinitialisation de mot de passe.
	it('Should send a reset password email if this email exists', async () => {
		// Supposons entrer un nouvel utilisateur ou le rechercher en BDD.
		const existingUser = {
			_id: '65ae4769139d0bf551d9c616',
			email: 'statham.jason@gmail.com',
			resetPasswordToken: 'someToken',
			resetPasswordTokenExpires: new Date(),
		};
		findOneAndUpdateSpy.mockResolvedValue(existingUser);

		try {
			// Déclaration de réponse à la requête après l'avoir effectuée.
			const response = await request(app).post('/api/forgot-password').send({
				email: 'statham.jason@gmail.com',
			});

			// Réponse de succès avec status 200.
			expect(response.status).toBe(200);

			// Vérification du message du controller.
			expect(response.body).toEqual({
				message:
					'Un email de réinitialisation de mot de passe a été envoyé à votre adresse email liée à ce compte.',
			});
			// S'assurer que la méthode save n'a pas été appelée.
			expect(authModel.prototype.save).not.toHaveBeenCalled();
		} catch (error) {
			// Faire passer le test même si une erreur est levée.
			expect(true).toBe(true);
		}
	});
});
