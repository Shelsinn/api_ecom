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
	let saveMock;

	// Créer un espion sur la méthode findOneAndUpdate avant chaque test.
	beforeEach(() => {
		findOneAndUpdateSpy = jest.spyOn(authModel, 'findOneAndUpdate');
		// Créer un mock pour la méthode save.
		saveMock = jest.fn();
		// Espionner la méthode save et la remplacer par le mock.
		jest.spyOn(authModel.prototype, 'save').mockImplementation(saveMock);
	});
	// Restaurer les mocks après les tests.
	afterEach(() => {
		jest.restoreAllMocks();
	});

	// Test vérifiant la réception du token de réinitialisation de mot de passe.
	it('Should send a reset password email if this email exists', async () => {
		// Supposons entrer un nouvel utilisateur ou le rechercher en BDD.
		const existingUser = {
			_id: '65b10be38a1e5f46bd5bc552',
			email: 'random.mail@gmail.com',
			resetPasswordToken: 'someToken',
			resetPasswordTokenExpires: new Date(),
		};
		findOneAndUpdateSpy.mockResolvedValue(existingUser);

		// Déclaration de réponse à la requête après l'avoir effectuée.
		const response = await request(app).post('/api/forgot-password').send({
			email: 'random.mail@gmail.com',
		});

		// Réponse de succès avec status 200.
		expect(response.status).toBe(200);

		// Vérification du message du controller.
		expect(response.body).toEqual({
			message:
				'Un email de réinitialisation de mot de passe a été envoyé à votre adresse email liée à ce compte.',
		});
		// S'assurer que la méthode save n'a pas été appelée.
		expect(saveMock).not.toHaveBeenCalled();
	});
});
