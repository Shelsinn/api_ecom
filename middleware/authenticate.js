// Import du modèle utilisateur.
const { Router } = require('express');
const authModel = require('../models/auth.model');
// Import du JWT.
const jwt = require('jsonwebtoken');

// Fonction pour la gestion de rôles.
module.exports.authenticate = async (req, res, next) => {
	try {
		// Définition de la variable pour l'autorisation.
		const authHeader = req.header('Authorization');
		// Condition qui vérifie la variable et qui ajoute un Bearer comme exception.
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({
				message:
					"Vous devez être connecté en tant qu'administrateur pour accéder à cette page.",
			});
		}
		// Extraction du token sans le préfixe 'Bearer'.
		const token = authHeader.split(' ')[1];
		// Ajout de la variable pour décoder le token.
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		// Déclaration d'une variable qui va récupérer l'id de l'utilisateur et lui assigner un token.
		const user = await authModel.findById(decoded.userId);
		// Si il n'y a pas d'utilisateur, renvoie un message.
		if (!user) {
			return res.status(400).json({ message: 'Utilisateur non trouvé.' });
		}
		req.user = user;
		next();
	} catch (error) {
		console.error("Erreur lors de l'authentification: ", error.message);
		res.status(500).json({ message: "Erreur lors de l'authentification." });
	}
};

// Fonction pour valider le token d'authentification.
module.exports.verifToken = async (req, res, next) => {
	try {
		// Définition de la variable pour l'autorisation.
		const authHeader = req.header('Authorization');

		// Condition qui vérifie la variable et qui ajoute un Bearer comme exception.
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({
				message: 'Vous devez être connecté pour effectuer cette action.',
			});
		}

		// Extraction du token sans le préfixe 'Bearer'.
		const token = authHeader.split(' ')[1];

		// Vérifier la validité du token en utilisant JWT.
		jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
			// Si une erreur survient pendant la vérification, renvoyer une erreur.
			if (err) {
				return res.status(401).json({ message: 'Token invalide.' });
			}

			// Si la vérification est réussie, ajouter les informations du token dans la requête.
			req.tokenInfo = decoded;

			// Passer à la prochaine étape du middleware ou à la route.
			next();
		});
	} catch (error) {
		console.error('Erreur lors de la validation du token: ', error.message);
		res.status(500).json({ message: 'Erreur lors de la validation du token.' });
	}
};
