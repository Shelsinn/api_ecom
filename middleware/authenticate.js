// Import du modèle utilisateur.
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
		const user = await authModel.findById(decoded.user.id);
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
