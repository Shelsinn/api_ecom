const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/authenticate');
const cloudinary = require('cloudinary').v2;
const cloudinaryUpload = require('../middleware/cloudinaryUpload');

// Route pour l'inscription.
router.post('/register', cloudinaryUpload, authController.register);

// Route pour la connexion.
router.post('/login', authController.login);

// Route pour la modification du profil.
router.put('/update/:id', cloudinaryUpload, authController.update);

// Route pour supprimer un profil.
router.delete('/delete/:id', authController.delete);

// Route protégée
router.get('/dashboard', authMiddleware.authenticate, (req, res) => {
	// Vérifier si l'utilisateur est un admin.
	if (req.user.role === 'admin') {
		// Définition de req.isAdmin, sera égal à true pour les admins.
		req.isAdmin = true;
		// Envoyer une réponse de succès.
		return res.status(200).json({ message: 'Bienvenue, Admin.' });
	} else {
		// Envoyer une réponse pour les utilisateurs non-admins.
		return res.status(403).json({ message: "Action non autorisée sans droits d'admin." });
	}
});

// Admin
// Route pour ajouter les informations.
// Route pour lire les informations.
// Route pour modifier les informations.
// Route pour supprimer le compte.

// Admin 2
// Route pour voir tous les utilisateurs.
// Route pour supprimer un utilisateur.

// User
// Route pour ajouter les informations.
// Route pour lire les informations.
// Route pour modifier les informations.
// Route pour supprimer le compte.

module.exports = router;
