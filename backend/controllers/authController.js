const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail } = require('../models/userModel');

// Kullanıcı kayıt işlemi
exports.register = async (req, res) => {
    const { nickname, email, password } = req.body;

    try {
        // Kullanıcı zaten var mı kontrol et
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Şifreyi hash'le
        const hashedPassword = await bcrypt.hash(password, 10);

        // Yeni kullanıcı oluştur ve veritabanına kaydet
        console.log("Creating user with: ", nickname, email);  // Hata tespiti için log ekleyelim
        const newUser = await createUser({ nickname, email, password: hashedPassword });

        // Başarılı olursa kullanıcıyı döndür
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error("Error registering user: ", error);
        res.status(500).json({ message: 'Error registering user', error });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.json({ message: 'Login successful', token, nickname: user.nickname });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

// E-posta ile kullanıcı adını al
exports.getUsernameByEmail = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Kullanıcı adı var ise dön
        res.status(200).json({ nickname: user.nickname });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error });
    }
};
