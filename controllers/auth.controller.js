// Import du modèle utilisateur.
const authModel = require("../models/auth.model");

// Import de la validation des données.
const { validationResult } = require("express-validator");

// Import du modèle de hachage bcrypt.
const bcrypt = require("bcrypt");

// Import du module JWT pour les tokens.
const jwt = require("jsonwebtoken");

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
    const { lastname, firstname, email, password } = req.body;
    // Vérification de la longueur du mot de passe avec une condition.
    if (password.length < 6) {
      // Vérification de la longueur du mot de passe. (6 caractères minimum)
      // Renvoie une erreur si le mot de passe est trop court.
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères." });
    }
    // Vérification de l'email s'il existe déjà dans la BDD.
    const existingUser = await authModel.findOne({ email });

    if (existingUser) {
      // Renvoie une erreur si l'email existe déjà.
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }
    // Création d'un nouvel utilisateur.
    const user = authModel.create({ lastname, firstname, email, password });
    // Renvoie une réponse positive si l'utilisateur est bien enregistré.
    res.status(201).json({ message: "Compte utilisateur créé avec succès.", user });
  } catch (error) {
    // Renvoie une erreur s'il y a un problème lors de l'enregistrement de l'utilisateur.
    res.status(500).json({ message: "Erreur lors de l'enregistrement de l'utilisateur." });
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
      console.log("Utilisateur non trouvé.");
      return res.status(400).json({ message: "Email invalide." });
    }
    // Vérification du mot de passe (password = mot de passe entré par l'utilisateur, user.password = mot de passe haché en BDD).
    const isPasswordValid = await bcrypt.compare(password, user.password);
    // Si le mot de passe est incorrect, renvoie une erreur.
    if (!isPasswordValid) {
      console.log("Mot de passe incorrect.");
      return res.status(400).json({ message: "Mot de passe incorrect." });
    }
    // Renvoi d'un message de succès.
    console.log("Connexion réussie.");
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
    const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });
    // Renvoi d'un message de réussite et le token.
    res.status(200).json({ message: "Connexion réussie.", token });
  } catch (error) {
    console.error("Erreur lors de la connexion: ", error.message);
    // Renvoie une erreur s'il y a un problème lors de la connexion de l'utilisateur.
    res.status(500).json({ message: "Erreur lors de la connexion." });
  }
};
