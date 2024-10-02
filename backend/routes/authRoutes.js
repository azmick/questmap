const express = require('express');
const { register, login, getUsernameByEmail } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);  // Kayıt ol için yönlendirme
router.post('/login', login);        // Giriş yap için yönlendirme
router.post('/get-username', getUsernameByEmail);


module.exports = router;
