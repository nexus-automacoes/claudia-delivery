const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const broadcast = require('../controllers/broadcast.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Multer config para upload de imagens do broadcast
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `broadcast-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens (jpg, png, gif, webp) sao permitidas'));
    }
  },
});

router.use(authMiddleware);

router.post('/send', upload.single('image'), broadcast.sendBroadcast);
router.post('/send-menu', broadcast.sendMenuBroadcast);
router.get('/logs', broadcast.getLogs);
router.get('/lists', broadcast.getLists);
router.post('/lists', broadcast.createList);
router.delete('/lists/:id', broadcast.deleteList);

module.exports = router;
