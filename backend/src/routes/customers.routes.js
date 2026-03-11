const router = require('express').Router();
const customers = require('../controllers/customers.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', customers.getCustomers);
router.get('/:id', customers.getCustomer);
router.post('/', customers.createCustomer);
router.put('/:id', customers.updateCustomer);
router.delete('/:id', customers.deleteCustomer);
router.post('/import', customers.importCustomers);

module.exports = router;
