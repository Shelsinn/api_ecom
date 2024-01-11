const productModel = require('../models/product.model');

// Fonction pour créer un produit (accessible seulement par l'administrateur).
module.exports.createProduct = async (req, res) => {
	try {
		// Vérifier si l'utilisateur est admin.
		if (req.user.role !== 'admin') {
			// Retour d'un message d'erreur.
			return res
				.status(403)
				.json({ message: 'Action non autorisée. Seul un admin peut créer un produit.' });
		}
		// Récupération des données du formulaire.
		const { title, description, price } = req.body;
		// Vérification si une image est téléchargée.
		if (!req.file) {
			return res.status(400).json({ message: 'Veuillez ajouter une image.' });
		}
		// Déclaration d'une variable pour récupérer le chemin de l'image après téléchargement.
		const imageUrl = req.file.path;
		// Déclaration d'une variable pour récupérer l'ID de l'utilisateur qui va poster un produit.
		const userId = req.user._id;
		// Création d'un produit.
		const newProduct = await productModel.create({
			title,
			description,
			price,
			imageUrl,
			createdBy: userId,
		});
		res.status(200).json({ message: 'Produit ajouté avec succès: ', product: newProduct });
	} catch (error) {
		console.error('Erreur lors de la création du produit: ', error.message);
		res.status(500).json({ message: 'Erreur lors de la création du produit.' });
	}
};

// Fonction pour récupérer tous les produits.
module.exports.getAllProducts = async (req, res) => {
	try {
		// Récupération de tous les produits.
		const products = await productModel.find();
		// Réponse de succès.
		res.status(200).json({ message: 'Liste des produits', products });
	} catch (error) {
		console.error('Erreur lors de la récupération des produits: ', error.message);
		res.status(500).json({ message: 'Erreur lors de la récupération des produits.' });
	}
};
