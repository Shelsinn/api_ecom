const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/authenticate');
const cloudinary = require('cloudinary').v2;
const cloudinaryUpload = require('../middleware/cloudinaryUpload');

////////// Routes générales. //////////

// Route pour l'inscription.
router.post('/api/register', cloudinaryUpload, authController.register);

// Route pour la vérification d'email.
router.get('/api/verify-email/:token', authController.verifyEmail);

// Route pour envoyer un email de reset de mot de passe.
router.post('/api/forgot-password', authController.forgotPassword);

// Route pour réinitialiser/modifier le mot de passe.
router.put('/api/update-password/:token', authController.updatePassword);

// Route pour la connexion.
router.post('/api/login', authController.login);

////////// Routes USERS. //////////

// Route pour lire ses informations.
router.get('/api/profile/:id', authMiddleware.verifToken, authController.userProfile);

// Route pour la modification du profil.
router.put('/api/update/:id', authMiddleware.verifToken, cloudinaryUpload, authController.update);

// Route pour supprimer notre profil.
router.delete('/api/delete/:id', authMiddleware.verifToken, authController.delete);

////////// Routes ADMIN. //////////

// Route protégée du dashboard.
router.get('/api/dashboard', authMiddleware.authenticate, authController.dashboard);

// Route pour voir tous les utilisateurs en tant qu'admin.
router.get('/api/all-users', authMiddleware.authenticate, authController.getAllUsers);

// Route pour voir le profil d'un utilisateur par ID en tant qu'admin.
router.get('/api/user/:id', authMiddleware.authenticate, authController.getUser);

// Route pour modifier les informations d'un user en tant qu'admin.
router.put(
	'/api/admin-update/:id',
	authMiddleware.authenticate,
	cloudinaryUpload,
	authController.adminUpdate
);

// Route pour supprimer un compte en tant qu'admin.
router.delete('/api/admin-delete/:id', authMiddleware.authenticate, authController.adminDelete);

module.exports = router;
