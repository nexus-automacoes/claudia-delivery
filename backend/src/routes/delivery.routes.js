const router = require('express').Router();
const delivery = require('../controllers/delivery.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/:id/dispatch', authMiddleware, delivery.dispatchOrder);
router.get('/:id/track', authMiddleware, delivery.trackDelivery);

module.exports = router;
