// Import du modèle utilisateur.
const authModel = require('../models/auth.model');

// Import de la validation des données.
const { validationResult } = require('express-validator');

// Import du modèle de hachage bcrypt.
const bcrypt = require('bcryptjs');

// Import du module JWT pour les tokens.
const jwt = require('jsonwebtoken');

// Import de Cloudinary.
const cloudinary = require('cloudinary').v2;

// Import du module Nodemailer pour l'envoi de mails.
const nodemailer = require('nodemailer');

// Import du module Crypto pour la génération de token.
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
	host: 'sandbox.smtp.mailtrap.io',
	port: 2525,
	auth: {
		user: process.env.MAILTRAP_USER,
		pass: process.env.MAILTRAP_PASS,
	},
});

// Déclaration de variables pour générer un token email avec le module crypto.
const generateVerificationToken = () => {
	return crypto.randomBytes(32).toString('hex');
};

// Déclaration de variables pour générer un token password avec le module crypto.
const generateVerificationTokenPassword = () => {
	return crypto.randomBytes(32).toString('hex');
};

// Fonction de vérification de l'envoi d'email.
const sendVerificationEmail = async (to, verificationToken) => {
	// Variable qui va contenir le lien de vérification.
	const verificationLink = `http://localhost:5000/verify?token=${verificationToken}`;

	const mailOptions = {
		from: 'unmailbidon@gmail.com',
		to,
		subject: 'Vérification de votre adresse mail.',
		text: `Merci de vérifier votre email en cliquant sur ce <a href=${verificationLink}>lien</a>.`,
		html: `<p>Merci de cliquer sur le lien pour vérifier votre adresse mail et pouvoir vous connecter.</p>`,
	};

	await transporter.sendMail(mailOptions);
};

// Fonction de vérification pour la réinitialisation du mot de passe.
const sendResetPasswordEmail = async (to, resetPasswordLink) => {
	const resetLink = `http://localhost:5000/update-password?token=${resetPasswordLink}`;

	const mailOptions = {
		from: 'unmailbidon@gmail.com',
		to,
		subject: 'Réinitialisation du mot de passe.',
		text: `Merci de cliquer sur ce <a href=${resetLink}>lien</a> pour réinitialiser votre mot de passe.`,
		html: `<p>Merci de cliquer sur le lien pour réinitialiser votre mot de passe.</p>`,
	};

	await transporter.sendMail(mailOptions);
};

// Fonction pour l'inscription.
module.exports.register = async (req, res) => {
	// Validation des données d'entrée.
	try {
		// Récupération des erreurs de validation.
		const errors = validationResult(req);
		// Vérification s'il y a des erreurs de validation.
		if (!errors.isEmpty()) {
			// Renvoi des erreurs de validation.
			return res.status(400).json({ errors: errors.array() });
		}
		// Récupération des données du formulaire.
		const { lastname, firstname, birthday, address, zipcode, city, phone, email, password } =
			req.body;

		// Vérifier si une image est téléversée.
		if (!req.cloudinaryUrl || !req.file) {
			return res.status(400).json({ message: 'Veuillez ajouter une image.' });
		}

		// Vérification de l'email s'il existe déjà dans la BDD.
		const existingAuth = await authModel.findOne({ email });

		if (existingAuth) {
			// Supprimer l'image téléchargée.
			if (req.file && req.file.public_id) {
				await cloudinary.uploader.destroy(req.file.public_id);
			}
			// Renvoie une erreur si l'email existe déjà.
			return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
		}

		// Utilisation de l'URL de Cloudinary et du public_id provenant du middleware.
		const avatarUrl = req.cloudinaryUrl;
		const avatarPublicId = req.file.public_id;
		// Création d'un nouvel utilisateur.
		const user = await authModel.create({
			lastname,
			firstname,
			birthday,
			address,
			zipcode,
			city,
			phone,
			email,
			password,
			avatarUrl,
			avatarPublicId,
		});

		// Vérification de la génération de token sécurisé.
		const verificationToken = generateVerificationToken();

		// Sauvegarder le token généré dans la BDD et l'associer à l'utilisateur.
		user.emailVerificationToken = verificationToken;
		user.emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
		await user.save();

		// Envoyer la vérification d'email.
		await sendVerificationEmail(user.email, verificationToken);

		// Renvoie une réponse positive si l'utilisateur est bien enregistré.
		const userMail = user.email;
		res.status(201).json({
			message: `Utilisateur créé avec succès. Merci de bien vouloir cliquer sur le lien envoyé à ${userMail} pour vérifier votre compte.`,
		});
	} catch (error) {
		// Renvoie une erreur s'il y a un problème lors de l'enregistrement de l'utilisateur.
		console.error("Erreur lors de l'enregistrement de l'utilisateur: ", error.message);
		// Supprimer l'image téléchargée si elle existe.
		if (req.file && req.file.public_id) {
			await cloudinary.uploader.destroy(req.file.public_id);
		}
		res.status(500).json({ message: "Erreur lors de l'enregistrement de l'utilisateur." });
	}
};

// Fonction pour la vérification d'email.
module.exports.verifyEmail = async (req, res) => {
	try {
		// Récupération du token pour le mettre en paramètre d'url.
		const { token } = req.params;

		// Trouver l'utilisateur avec le token associé.
		const user = await authModel.findOne({ emailVerificationToken: token });

		if (!user) {
			return res.status(404).json({ message: 'Utilisateur non trouvé.' });
		}

		// Vérifier si le token n'a pas expiré.
		if (user.emailVerificationTokenExpires && user.emailVerificationTokenExpires < Date.now()) {
			await cloudinary.uploader.destroy(user);
			await user.remove();
			return res.status(400).json({ message: 'Le token a expiré.' });
		}

		// Mettre à jour isEmailVerified à true et sauvegarder.
		user.isEmailVerified = true;
		// Effacer le token après vérification.
		user.emailVerificationToken = undefined;
		// Effacer la date d'expiration du token.
		user.emailVerificationTokenExpires = undefined;
		// Sauvegarder.
		await user.save();

		// Message de réussite.
		res.status(200).json({ message: 'Email vérifié avec succès.' });
	} catch (error) {
		console.error("Erreur lors de la vérification de l'email: ", error.message);
		res.status(500).json({ message: "Erreur lors de la vérification de l'email." });
	}
};

// Fonction pour la demande de reset de mot de passe par mail.
module.exports.forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;

		// Rechercher l'user par l'email.
		const user = await authModel.findOne({ email });

		// Condition si aucun utilisateur n'est trouvé.
		if (!user) {
			return res.status(404).json({ message: 'Aucun utilisateur trouvé avec cet email.' });
		}

		// Générer un token de réinitialisation de mot de passe.
		const resetPasswordToken = generateVerificationTokenPassword();

		// Enregistrer le token de réinitialisation de mot de passe et sa date d'expiration en BDD.
		user.resetPasswordToken = resetPasswordToken;
		user.resetPasswordTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
		await user.save();

		// Envoyer un email avec le lien de réintialisation de mot de passe.
		await sendResetPasswordEmail(user.email, resetPasswordToken);

		// Message de réussite.
		res.status(200).json({
			message:
				'Un email de réinitialisation de mot de passe a été envoyé à votre adresse email liée à ce compte.',
		});
	} catch (error) {
		console.error(
			'Erreur lors de la demande de réinitialisation du mot de passe: ',
			error.message
		);
		return res
			.status(500)
			.json({ message: 'Erreur lors de la demande de réinitialisation du mot de passe.' });
	}
};

// Fonction pour reset le mot de passe avec le token de reset.
module.exports.updatePassword = async (req, res) => {
	try {
		// Récupération du token pour le mettre en param URL.
		const { token } = req.params;
		// Ajout de deux nouveaux champs dans la requête.
		const { newPassword, confirmNewPassword } = req.body;
		// Vérifier si les champs de mots de passe correspondent.
		if (newPassword !== confirmNewPassword) {
			return res.status(400).json({ message: 'Les mots de passe ne correspondent pas.' });
		}
		// Trouver l'user par le token de reset de MDP.
		const user = await authModel.findOne({
			resetPasswordToken: token,
			resetPasswordTokenExpires: { $gt: Date.now() },
		});

		// Vérifier si le token est valide.
		if (!user) {
			return res.status(400).json({ message: 'Token invalide ou expiré.' });
		}
		// Mettre à jour le MDP.
		user.password = newPassword;
		// Effacer le token et son expiration.
		user.resetPasswordToken = undefined;
		user.resetPasswordTokenExpires = undefined;
		// Enregistrer.
		await user.save();
		// Réponse de succès.
		res.status(200).json({ message: 'Mot de passe modifié avec succès.' });
	} catch (error) {
		console.error('Erreur lors de la modification du mot de passe: ', error.message);
		return res.status(500).json({ message: 'Erreur lors de la modification du mot de passe.' });
	}
};

// Fonction pour la connexion.
module.exports.login = async (req, res) => {
	// Validation des données d'entrée.
	try {
		// Récupération des erreurs de validation.
		const errors = validationResult(req);
		// Vérification s'il y a des erreurs de validation.
		if (!errors.isEmpty()) {
			// Renvoi des erreurs de validation.
			return res.status(400).json({ errors: errors.array() });
		}
		// Récupération des données du formulaire.
		const { email, password } = req.body;
		// Vérification si l'utilisateur existe déjà dans la BDD.
		const user = await authModel.findOne({ email });
		// Si l'utilisateur n'existe pas, renvoie une erreur.
		if (!user) {
			console.log('Utilisateur non trouvé.');
			return res.status(400).json({ message: 'Email invalide.' });
		}
		// Vérification du mot de passe (password = mot de passe entré par l'utilisateur, user.password = mot de passe haché en BDD).
		const isPasswordValid = await bcrypt.compare(password, user.password);
		// Si le mot de passe est incorrect, renvoie une erreur.
		if (!isPasswordValid) {
			console.log('Mot de passe incorrect.');
			return res.status(400).json({ message: 'Mot de passe incorrect.' });
		}
		// Renvoi d'un message de succès.
		console.log('Connexion réussie.');
		// Création du token JWT.
		const payload = {
			user: {
				id: user._id,
				email: user.email,
			},
		};
		// Définition de la variable pour le token.
		const secretKey = process.env.JWT_SECRET;
		// Définition de la date d'expiration du token.
		const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
		// Renvoi d'un message de réussite et le token.
		res.status(200).json({ message: 'Connexion réussie.', token });
	} catch (error) {
		console.error('Erreur lors de la connexion: ', error.message);
		// Renvoie une erreur s'il y a un problème lors de la connexion de l'utilisateur.
		res.status(500).json({ message: 'Erreur lors de la connexion.' });
	}
};

// Fonction pour récupérer son profil en tant qu'user avec son ID.
module.exports.userProfile = async (req, res) => {
	try {
		// Récupération de l'ID de l'utilisateur.
		const userId = req.params.id;

		// Déclaration de variable qui va vérifier si l'utilisateur existe.
		const existingUser = await authModel.findById(userId);

		// Condition si l'utilisateur n'existe pas en BDD.
		if (!existingUser) {
			return res.status(404).json({ message: 'Utilisateur non trouvé.' });
		}

		// Réponse de succès.
		res.status(200).json({ message: 'Utilisateur: ', existingUser });
	} catch (error) {
		console.error("Erreur lors de la récupération de l'utilisateur: ", error.message);
		res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur." });
	}
};

// Fonction pour la modification du profil.
module.exports.update = async (req, res) => {
	try {
		// Déclaration de variables pour la gestion des erreurs de validation.
		const errors = validationResult(req);

		// Vérification s'il y a des erreurs de validation.
		if (!errors.isEmpty()) {
			// Renvoi des erreurs de validation.
			return res.status(400).json({ errors: errors.array() });
		}

		// Récupération de l'ID de l'utilisateur.
		const userId = req.params.id;

		// Récupération des données du formulaire.
		const { lastname, firstname, email, newPassword, birthday, address, zipcode, city, phone } =
			req.body;

		// Vérifier si l'utilisateur existe avant de modifier.
		const existingUser = await authModel.findById(userId);

		// Condition si l'utilisateur n'existe pas en BDD.
		if (!existingUser) {
			return res.status(404).json({ message: 'Utilisateur non trouvé.' });
		}

		// Supprimer l'ancienne image sur Cloudinary si elle existe.
		if (req.file) {
			// Supprimer l'ancienne image s'il y en a une.
			if (existingUser.avatarPublicId) {
				await cloudinary.uploader.destroy(existingUser.avatarPublicId);
			}
			// Redonne une nouvelle URL et un nouvel id à l'image.
			existingUser.avatarUrl = req.cloudinaryUrl;
			existingUser.avatarPublicId = req.file.public_id;
		}

		// Mettre à jour les infos de l'utilisateur.
		existingUser.lastname = lastname;
		existingUser.firstname = firstname;
		existingUser.birthday = birthday;
		existingUser.address = address;
		existingUser.zipcode = zipcode;
		existingUser.city = city;
		existingUser.phone = phone;

		// Mettre à jour l'email uniquement si fourni dans la requête.
		if (email) {
			existingUser.email = email;
		}

		// Mettre à jour le mot de passe uniquement si fourni dans la requête.
		if (newPassword) {
			existingUser.password = newPassword;
		}

		// Sauvegarder les modifs.
		await existingUser.save();

		// Code de réussite avec le log.
		res.status(200).json({ message: 'Profil modifié avec succès: ', user: existingUser });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Erreur lors de la mise à jour du profil.' });
	}
};

// Fonction pour la suppression du profil.
module.exports.delete = async (req, res) => {
	try {
		// Récupération de l'ID de l'utilisateur.
		const userId = req.params.id;

		// Déclaration de variable qui va vérifier si l'utilisateur existe.
		const existingUser = await authModel.findById(userId);

		// Suppression de l'avatar de Cloudinary si celui-ci existe.
		if (existingUser.avatarPublicId) {
			await cloudinary.uploader.destroy(existingUser.avatarPublicId);
		}

		// Supprimer l'utilisateur de la BDD.
		await authModel.findByIdAndDelete(userId);

		// Message de succès.
		res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
	} catch (error) {
		res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur." });
	}
};

// Fonction pour le dashboard.
module.exports.dashboard = async (req, res) => {
	try {
		// Verifier si l'utilisateur est un admin
		if (req.user.role === 'admin') {
			// Definition de req.isAdmin sera egal a true pour les admins
			req.isAdmin = true;
			// Envoyer une réponse de succès
			return res.status(200).json({ message: 'Bienvenue Admin' });
		} else {
			// Envoyer une réponse pour les utilisateurs non admin
			return res.status(403).json({
				message: 'Action non autorisée, seuls les admins peuvent accéder à cette page.',
			});
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Erreur lors de la connexion.' });
	}
};

// Fonction pour récupérer tous les utilisateurs en tant qu'admin.
module.exports.getAllUsers = async (req, res) => {
	try {
		// Vérifier si l'utilisateur est admin.
		if (req.user.role !== 'admin') {
			// Retour d'un message d'erreur.
			return res.status(403).json({
				message: 'Action non autorisée. Seul un admin peut réaliser cette action.',
			});
		}
		// Récupération de tous les users.
		const users = await authModel.find();
		// Réponse de succès.
		res.status(200).json({ message: 'Liste des utilisateurs', users });
	} catch (error) {
		console.error('Erreur lors de la récupération des utilisateurs: ', error.message);
		res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.' });
	}
};

// Fonction pour récupérer un utilisateur par son ID en tant qu'admin.
module.exports.getUser = async (req, res) => {
	try {
		// Vérifier si l'utilisateur est admin.
		if (req.user.role !== 'admin') {
			// Retour d'un message d'erreur.
			return res.status(403).json({
				message: 'Action non autorisée. Seul un admin peut réaliser cette action.',
			});
		}
		// Récupération de l'ID de l'utilisateur.
		const userId = req.params.id;

		// Déclaration de variable qui va vérifier si l'utilisateur existe.
		const existingUser = await authModel.findById(userId);

		// Condition si l'utilisateur n'existe pas en BDD.
		if (!existingUser) {
			return res.status(404).json({ message: 'Utilisateur non trouvé.' });
		}

		// Réponse de succès.
		res.status(200).json({ message: 'Utilisateur: ', existingUser });
	} catch (error) {
		console.error("Erreur lors de la récupération de l'utilisateur: ", error.message);
		res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur." });
	}
};

// Fonction pour modifier un utilisateur en tant qu'admin.
module.exports.adminUpdate = async (req, res) => {
	try {
		// Vérifier si l'utilisateur est admin.
		if (req.user.role !== 'admin') {
			// Retour d'un message d'erreur.
			return res.status(403).json({
				message: 'Action non autorisée. Seul un admin peut réaliser cette action.',
			});
		}

		// Déclaration de variables pour la gestion des erreurs de validation.
		const errors = validationResult(req);

		// Vérification s'il y a des erreurs de validation.
		if (!errors.isEmpty()) {
			// Renvoi des erreurs de validation.
			return res.status(400).json({ errors: errors.array() });
		}

		// Récupération de l'ID de l'utilisateur.
		const userId = req.params.id;

		// Récupération des données du formulaire.
		const { lastname, firstname, email, birthday, address, zipcode, city, phone } = req.body;

		// Vérifier si l'utilisateur existe avant de modifier.
		const existingUser = await authModel.findById(userId);

		// Condition si l'utilisateur n'existe pas en BDD.
		if (!existingUser) {
			return res.status(404).json({ message: 'Utilisateur non trouvé.' });
		}

		// Supprimer l'ancienne image sur Cloudinary si elle existe.
		if (req.file) {
			// Supprimer l'ancienne image s'il y en a une.
			if (existingUser.avatarPublicId) {
				await cloudinary.uploader.destroy(existingUser.avatarPublicId);
			}
			// Redonne une nouvelle URL et un nouvel id à l'image.
			existingUser.avatarUrl = req.cloudinaryUrl;
			existingUser.avatarPublicId = req.file.public_id;
		}

		// Mettre à jour les infos de l'utilisateur.
		existingUser.lastname = lastname;
		existingUser.firstname = firstname;
		existingUser.birthday = birthday;
		existingUser.address = address;
		existingUser.zipcode = zipcode;
		existingUser.city = city;
		existingUser.phone = phone;

		// Mettre à jour l'email uniquement si fourni dans la requête.
		if (email) {
			existingUser.email = email;
		}

		// Sauvegarder les modifs.
		const updateProfile = await existingUser.save();

		// Code de réussite avec le log.
		res.status(200).json({ message: 'Profil modifié avec succès: ', user: updateProfile });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Erreur lors de la mise à jour du profil.' });
	}
};

// Fonction pour supprimer un utilisateur en tant qu'admin.
module.exports.adminDelete = async (req, res) => {
	try {
		// Vérifier si l'utilisateur est admin.
		if (req.user.role !== 'admin') {
			// Retour d'un message d'erreur.
			return res.status(403).json({
				message: 'Action non autorisée. Seul un admin peut réaliser cette action.',
			});
		}
		// Récupération de l'ID de l'utilisateur.
		const userId = req.params.id;

		// Déclaration de variable qui va vérifier si l'utilisateur existe.
		const existingUser = await authModel.findById(userId);

		// Suppression de l'avatar de Cloudinary si celui-ci existe.
		if (existingUser.avatarPublicId) {
			await cloudinary.uploader.destroy(existingUser.avatarPublicId);
		}

		// Supprimer l'utilisateur de la BDD.
		await authModel.findByIdAndDelete(userId);

		// Message de succès.
		res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
	} catch (error) {
		res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur." });
	}
};
