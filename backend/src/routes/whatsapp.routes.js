const router = require('express').Router();
const whatsapp = require('../controllers/whatsapp.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/status', whatsapp.getStatus);
router.post('/connect', whatsapp.connect);
router.post('/disconnect', whatsapp.disconnect);
router.post('/send', whatsapp.sendMessage);

module.exports = router;
