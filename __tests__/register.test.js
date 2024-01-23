// Import du module supertest.
const request = require('supertest');

// Import du module mongoose.
const mongoose = require('mongoose');

// Import de l'application.
const app = require('../server');

// Import de path.
const path = require('path');

// Connexion à la BDD avant l'exécution des tests.
beforeAll(async () => {
	// Utilisation de la méthode connect de mongoose.
	await mongoose.connect(process.env.MONGO_URI);
	// Attente d'une seconde pour assurer la connexion à la BDD.
	await new Promise((resolve) => setTimeout(resolve, 1000));
});

// Fermeture de la connexion à la BDD après exécution des tests.
afterAll(async () => {
	// Utilisation de la méthode close de mongoose pour fermer la connexion.
	await mongoose.connection.close();
});

// Bloc de tests pour la route register.
describe('Register route testing', () => {
	// Tests spécifiques pour la création d'un utilisateur.
	it('Should return 201 if user is successfully created.', async () => {
		// Utilisation de supertest pour envoyer une requête.
		const response = await request(app)
			.post('/api/register')
			// Remplissage des champs du formulaire.
			.field('lastname', 'Adminest')
			.field('firstname', 'Adminer')
			.field('birthday', '21/04/1992')
			.field('address', '45 rue du dev')
			.field('zipcode', '89560')
			.field('city', 'binaryville')
			.field('phone', '0606060606')
			.field('email', 'random.mail@gmail.com')
			.field('password', '123456')
			// Attache un fichier à la requête (exemple: image).
			.attach('image', path.resolve(__dirname, '../images/jason.jpg'));

		// Affichage de la réponse reçue dans la console.
		console.log('Received response', response.body);

		// Assertion vérifiant que le statut de la réponse est 201.
		expect(response.status).toBe(201);

		// Assertion vérifiant que la propriété message contient le message attendu.
		expect(response.body).toHaveProperty(
			'message',
			`Utilisateur créé avec succès. Merci de bien vouloir cliquer sur le lien envoyé à statham.jason@gmail.com pour vérifier votre compte.`
		);
	});
});
