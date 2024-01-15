// Import de mongoose pour la gestion avec la BDD.
const mongoose = require('mongoose');

// Import de bcrypt pour le hachage de mots de passe.
const bcrypt = require('bcryptjs');

// Import de validator pour la validation de l'email.
const validator = require('validator');

// Définition du schéma de l'utilisateur.
const authSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		validate: {
			validator: (value) => validator.isEmail(value),
			message: 'Adresse email invalide.',
		},
	},
	password: {
		type: String,
		required: [true, 'Veuillez entrer un mot de passe.'],
	},
	role: {
		type: String,
		enum: ['user', 'admin'],
		default: 'user',
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
});

// Hachage du mot de passe avant de sauvegarder l'utilisateur.
authSchema.pre('save', async function (next) {
	try {
		if (!this.isModified('password')) {
			return next();
		}
		const hashedPassword = await bcrypt.hash(this.password, 10);
		this.password = hashedPassword;
		return next();
	} catch (error) {
		return next(error);
	}
});

// Méthode pour comparer le mot de passe.
authSchema.methods.comparePassword = async function (paramPassword) {
	try {
		return await bcrypt.compare(paramPassword, this.password);
	} catch (error) {
		throw new Error(error);
	}
};

// Export du modèle, du schéma et mise dans la variable User.
const Auth = mongoose.model('Auth', authSchema);

// Export de la variable User.
module.exports = Auth;
