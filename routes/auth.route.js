const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/authenticate');
const cloudinary = require('cloudinary').v2;
const cloudinaryUpload = require('../middleware/cloudinaryUpload');

////////// Routes générales. //////////

// Route pour l'inscription.
router.post('/register', cloudinaryUpload, authController.register);

// Route pour la connexion.
router.post('/login', authController.login);

////////// Routes USERS. //////////

// Route pour lire ses informations.
router.get('/profile/:id', authController.userProfile);

// Route pour la modification du profil.
router.put('/update/:id', cloudinaryUpload, authController.update);

// Route pour supprimer notre profil.
router.delete('/delete/:id', authController.delete);

////////// Routes ADMIN. //////////

// Route protégée du dashboard.
router.get('/dashboard', authMiddleware.authenticate, authController.dashboard);

// Route pour voir tous les utilisateurs en tant qu'admin.
router.get('/all-users', authMiddleware.authenticate, authController.getAllUsers);

// Route pour voir le profil d'un utilisateur par ID en tant qu'admin.
router.get('/user/:id', authMiddleware.authenticate, authController.getUser);

// Route pour modifier les informations d'un user en tant qu'admin.
router.put(
	'/admin-update/:id',
	authMiddleware.authenticate,
	cloudinaryUpload,
	authController.adminUpdate
);

// Route pour supprimer un compte en tant qu'admin.
router.delete('/admin-delete/:id', authMiddleware.authenticate, authController.adminDelete);

module.exports = router;
