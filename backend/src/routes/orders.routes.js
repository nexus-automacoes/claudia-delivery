const router = require('express').Router();
const orders = require('../controllers/orders.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', orders.getOrders);
router.get('/stats', orders.getStats);
router.get('/:id', orders.getOrder);
router.post('/', orders.createOrder);
router.patch('/:id/status', orders.updateStatus);

module.exports = router;
