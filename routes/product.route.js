const router = require('express').Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/authenticate');
const upload = require('../middleware/upload');

// Route pour la création d'un produit en tant qu'admin en prenant en compte authMiddleware.authenticate.
router.post(
	'/create-product',
	authMiddleware.authenticate,
	upload.single('image'),
	productController.createProduct
);

// Route pour récupérer tous les produits.
router.get('/all-products', productController.getAllProducts);

// Route pour récupérer un seul produit avec son ID.
router.get('/product/:id', productController.getProductById);

// Route pour supprimer un produit avec son ID en tant qu'admin.
router.delete('/delete-product/:id', authMiddleware.authenticate, productController.deleteProduct);

// Route pour modifier un produit avec son ID en tant qu'admin.
router.put(
	'/update-product/:id',
	authMiddleware.authenticate,
	upload.single('image'),
	productController.updateProduct
);

module.exports = router;
