// On importe mongoose.
const mongoose = require('mongoose');
const url = process.env.MONGO_URI;

const connectDB = () => {
	mongoose
		.connect(url)
		// Le .then() est une promesse qui permet de gérer la connexion avec la BDD et le .catch() permet de gérer et capturer les erreurs.
		.then(() => {
			console.log('Connexion à la Base De Données réussie.');
		})
		.catch((error) => {
			console.error('Erreur de connexion avec la Base De Données.', error.message);
		});
};

// Export de la fonction connectDB.
module.exports = connectDB;
