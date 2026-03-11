const router = require('express').Router();
const menu = require('../controllers/menu.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/products', menu.getProducts);
router.get('/products/:id', menu.getProduct);
router.post('/products', authMiddleware, menu.createProduct);
router.put('/products/:id', authMiddleware, menu.updateProduct);
router.delete('/products/:id', authMiddleware, menu.deleteProduct);
router.patch('/products/:id/toggle', authMiddleware, menu.toggleAvailability);

router.get('/categories', menu.getCategories);
router.post('/categories', authMiddleware, menu.createCategory);

module.exports = router;
