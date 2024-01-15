// Import de mongoose pour la gestion avec la BDD.
const mongoose = require('mongoose');

// Définition du schéma du produit.
const userSchema = new mongoose.Schema({
	lastname: {
		type: String,
		required: [true, 'Veuillez renseigner un nom de famille.'],
	},
	firstname: {
		type: String,
		required: [true, 'Veuillez renseigner un prénom.'],
	},
	birthday: {
		type: String,
		required: [true, "Veuillez renseigner une date d'anniversaire."],
	},
	address: {
		type: String,
		required: [true, 'Veuillez renseigner une adresse.'],
	},
	zipcode: {
		type: String,
		required: [true, 'Veuillez renseigner un code postal.'],
	},
	city: {
		type: String,
		required: [true, 'Veuillez renseigner une ville.'],
	},
	phone: {
		type: String,
		required: [true, 'Veuillez renseigner un numéro de téléphone.'],
	},
	avatarUrl: {
		type: String,
	},
	avatarPublicId: {
		type: String,
		default: null,
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
});

// Export du modèle, du schéma et mise dans la variable User.
const User = mongoose.model('User', userSchema);

// Export de la variable User.
module.exports = User;
