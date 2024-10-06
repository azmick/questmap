const express = require('express');
const { register, login, getUsernameByEmail,uploadQuestion,getUserQuestions,updateQuestion,deleteQuestion,verifyToken } = require('../controllers/authController');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const multer= require('multer');

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

// Rate limiter'ı tanımlıyoruz: Bu örnekte 15 dakika içinde 5 istek sınırı koyuyoruz
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 5, // Maksimum 5 deneme
    message: 'Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.',
    headers: true,
  });
  
  const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 3, // Maksimum 3 kayıt denemesi
    message: 'Çok fazla kayıt denemesi. Lütfen 15 dakika sonra tekrar deneyin.',
    headers: true,
  });

// Giriş ve kayıt işlemleri
router.post('/login', login);
router.post('/register', register);
router.post('/get-username', getUsernameByEmail);

// Soru yükleme (multer ile)
router.post('/upload-question',verifyToken, upload.single('image'), uploadQuestion);

// Soruları getirme, güncelleme ve silme
router.get('/questions/:userId',verifyToken, getUserQuestions);
router.put('/questions/:questionId', updateQuestion);
router.delete('/questions/:questionId', deleteQuestion);


module.exports = router;
