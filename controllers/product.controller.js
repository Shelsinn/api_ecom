const productModel = require('../models/product.model');
const cloudinary = require('cloudinary').v2;

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
		if (!req.cloudinaryUrl || !req.file) {
			return res.status(400).json({ message: 'Veuillez ajouter une image.' });
		}
		// Déclaration d'une variable pour récupérer l'ID de l'utilisateur qui va poster un produit.
		const userId = req.user._id;
		// Utilisation de l'URL de Cloudinary et du public_id provenant du middleware.
		const imageUrl = req.cloudinaryUrl;
		const imagePublicId = req.file.public_id;
		// Création d'un produit.
		const newProduct = await productModel.create({
			title,
			description,
			price,
			imageUrl,
			imagePublicId,
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

// Fonction pour récupérer un seul produit avec son ID.
module.exports.getProductById = async (req, res) => {
	try {
		// Déclaration de la variable qui va rechercher l'ID du produit.
		const productId = req.params.id;
		// Récupération du produit par son ID.
		const product = await productModel.findById(productId);
		// Condition si le produit est introuvable.
		if (!product) {
			return res.status(404).json({ message: 'Produit non trouvé.' });
		}
		// Réponse de succès.
		res.status(200).json({ message: 'Produit récupéré avec succès.', product });
	} catch (error) {
		console.error('Erreur lors de la récupération du produit: ', error.message);
		res.status(500).json({ message: 'Erreur lors de la récupération du produit.' });
	}
};

// Fonction pour supprimer un produit avec son ID.
module.exports.deleteProduct = async (req, res) => {
	try {
		// Vérifier si l'utilisateur est admin.
		if (req.user.role !== 'admin') {
			// Retour d'un message d'erreur.
			return res.status(403).json({
				message: 'Action non autorisée. Seul un admin peut supprimer un produit.',
			});
		}
		// Déclaration de la variable qui va rechercher l'id du produit.
		const productId = req.params.id;

		// Déclaration de la variable pour supprimer le produit.
		const product = await productModel.findById(productId);

		// Vérifier si le produit existe.
		if (!product) {
			return res.status(404).json({ message: 'Produit non trouvé.' });
		}

		// Rechercher l'id de l'image sur Cloudinary.
		const imagePublicId = product.imagePublicId;

		// Suppression du produit.
		const deletedProduct = await productModel.findByIdAndDelete(productId);

		// Condition si le produit est introuvable.
		if (!deletedProduct) {
			return res.status(404).json({ message: 'Produit non trouvé.' });
		}
		console.log('Image Public ID: ', imagePublicId);
		console.log('Produit supprimé avec succès.');

		// Suppression de l'image dans Cloudinary.
		if (imagePublicId) {
			await cloudinary.uploader.destroy(imagePublicId);
			console.log('Image supprimée de Cloudinary.');
		}

		res.status(200).json({ message: 'Produit supprimé avec succès.' });
	} catch (error) {
		console.error('Erreur lors de la suppression du produit: ', error.message);
		res.status(500).json({ message: 'Erreur lors de la suppression du produit.' });
	}
};

// Fonction pour modifier un produit avec son ID.
module.exports.updateProduct = async (req, res) => {
	try {
		// Vérifier si l'utilisateur est admin.
		if (req.user.role !== 'admin') {
			// Retour d'un message d'erreur.
			return res.status(403).json({
				message: 'Action non autorisée. Seul un admin peut modifier un produit.',
			});
		}
		// Déclaration de la variable qui va rechercher l'id du produit.
		const productId = req.params.id;

		// Déclaration de la variable qui va trouver le produit avec son ID.
		const modifiedProduct = await productModel.findById(productId);

		// Condition si le produit est introuvable.
		if (!modifiedProduct) {
			return res.status(404).json({ message: 'Produit non trouvé.' });
		}
		// Mettre à jour les propriétés du produit avec les données du corps de la requête.
		modifiedProduct.title = req.body.title || modifiedProduct.title;
		modifiedProduct.description = req.body.description || modifiedProduct.description;
		modifiedProduct.price = req.body.price || modifiedProduct.price;

		// Vérifier si une nouvelle image est téléchargée et mettre à jour le chemin de l'image.
		if (req.file) {
			// Supprimer l'ancienne image s'il y en a une.
			if (modifiedProduct.imagePublicId) {
				await cloudinary.uploader.destroy(modifiedProduct.imagePublicId);
			}
			// Redonne une nouvelle URL et un nouvel id à l'image.
			modifiedProduct.imageUrl = req.cloudinaryUrl;
			modifiedProduct.imagePublicId = req.file.public_id;
		}

		// Sauvegarder les modifications dans la BDD.
		const updateProduct = await modifiedProduct.save();
		res.status(200).json({ message: 'Produit modifié avec succès.', product: updateProduct });
	} catch (error) {
		console.error('Erreur lors de la modification du produit: ', error.message);
		res.status(500).json({ message: 'Erreur lors de la modification du produit.' });
	}
};
