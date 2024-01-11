// Import de mongoose pour la gestion avec la BDD.
const mongoose = require('mongoose');

// Définition du schéma du produit.
const productSchema = new mongoose.Schema({
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	title: {
		type: String,
		required: [true, 'Veuillez renseigner le nom du produit.'],
	},
	description: {
		type: String,
		required: [true, 'Veuillez renseigner une description de produit.'],
	},
	price: {
		type: Number,
		required: [true, 'Veuillez renseigner un prix.'],
	},
	imageUrl: {
		type: String,
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
});

// Export du modèle, du schéma et mise dans la variable User.
const Product = mongoose.model('Product', productSchema);

// Export de la variable User.
module.exports = Product;
