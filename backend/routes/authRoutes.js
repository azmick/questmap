const express = require('express');
const {
  register,
  login,
  getUsernameByEmail,
  uploadQuestion,
  getUserQuestions,
  updateUserQuestion, 
  deleteUserQuestion, 
  verifyToken,
  validateToken
} = require('../controllers/authController');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const multer = require('multer');

// Multer ayarları
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Rate limiter tanımlamaları
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.',
  headers: true,
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: 'Çok fazla kayıt denemesi. Lütfen 15 dakika sonra tekrar deneyin.',
  headers: true,
});

// Giriş ve kayıt işlemleri
router.post('/login', login);
router.post('/register', register);
router.post('/get-username', getUsernameByEmail);

// Soru yükleme (multer ile)
router.post('/upload-question', verifyToken, upload.single('image'), uploadQuestion);

// Soruları getirme, güncelleme ve silme
router.get('/questions/:userId', verifyToken, getUserQuestions);
router.put('/questions/:questionId', verifyToken, updateUserQuestion);
router.delete('/questions/:questionId', verifyToken, deleteUserQuestion);

router.post('/verify-token', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  const decoded = validateToken(token);

  if (decoded) {
    res.status(200).json({ message: 'Token is valid' });
  } else {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

module.exports = router;
