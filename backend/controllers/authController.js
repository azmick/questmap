const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { createUser, findUserByEmail } = require('../models/userModel');
const { createQuestion, updateQuestion, deleteQuestion } = require('../models/questionModel');
const { createUserTest, getUserTestByUserId } = require('../models/userTestModel');
const pool = require('../config/db');
const secretKey = process.env.JWT_SECRET;

// Multer ile dosya yükleme işlemi
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Yükleme dizini
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Dosya adını belirleme
  }
});
const upload = multer({ storage: storage });

// Token doğrulama fonksiyonu
const validateToken = (token) => {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded; // Geçerli bir token ise decode edilmiş veriyi döner
  } catch (error) {
    console.error('Token validation error:', error);
    return false; // Token geçersiz veya süresi dolmuşsa false döner
  }
};

// Kullanıcı kayıt işlemi
const register = async (req, res) => {
  const { nickname, email, password } = req.body;

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Bu e-posta zaten kullanımda' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await createUser({ nickname, email, password: hashedPassword });

    res.status(201).json({ message: 'Kayıt başarılı', user: newUser });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Sunucu hatası: Kayıt sırasında bir hata oluştu.' });
  }
};

// Kullanıcı giriş işlemi
const login = async (req, res) => {
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

    const token = jwt.sign({ id: user.id, email: user.email }, secretKey, {
      expiresIn: '1h'
    });

    res.json({ message: 'Login successful', token, nickname: user.nickname, userId: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

// Kullanıcı adı alma işlemi
const getUsernameByEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ nickname: user.nickname });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user', error });
  }
};

// Soru yükleme işlemi
const uploadQuestion = async (req, res) => {
  try {
    const { lesson, topic, title, description } = req.body;
    const image = req.file;
    const userId = req.user.id;

    if (!image) {
      return res.status(400).json({ message: 'Dosya yüklenmedi' });
    }

    const newQuestion = await createQuestion({
      user_id: userId,
      lesson,
      topic,
      images: [image.filename],
      title,
      description
    });

    res.status(200).json({ message: 'Soru başarıyla yüklendi', question: newQuestion });
  } catch (error) {
    console.error('Soru yüklenirken hata:', error);
    res.status(500).json({ message: 'Soru yüklenirken bir hata oluştu', error });
  }
};

// Kullanıcının sorularını getirme
const getUserQuestions = async (req, res) => {
  const userId = req.user.id;
  const { lesson, topic } = req.query;

  try {
    let query = `SELECT * FROM questions WHERE user_id = $1`;
    const queryParams = [userId];

    if (lesson) {
      query += ` AND lesson = $2`;
      queryParams.push(lesson);
    }
    if (topic) {
      query += ` AND topic = $3`;
      queryParams.push(topic);
    }

    const result = await pool.query(query, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Error fetching questions', error });
  }
};

// Soru güncelleme işlemi
const updateUserQuestion = async (req, res) => {
  const { questionId } = req.params;
  const { lesson, topic, description } = req.body;

  try {
    const updatedQuestion = await updateQuestion(questionId, { lesson, topic, description });
    res.status(200).json({ message: 'Question updated successfully', question: updatedQuestion });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Error updating question', error });
  }
};

const deleteUserQuestion = async (req, res) => {
  const { questionId } = req.params;

  try {
    await deleteQuestion(questionId);
    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Error deleting question', error });
  }
};

// Token doğrulama middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const decoded = validateToken(token);
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
};

// Test sonucu kaydetme
const saveUserTest = async (req, res) => {
  const userId = req.user.id;
  const { result } = req.body;

  try {
      // Kullanıcının zaten bir testi var mı kontrol et
      const existingTest = await getUserTestByUserId(userId);
      if (existingTest) {
          return res.status(400).json({ message: 'Bu testi zaten çözdünüz.' });
      }

      // Yeni test sonucu oluştur
      const newTest = await createUserTest(userId, result);
      res.status(201).json({ message: 'Test sonucu başarıyla kaydedildi', test: newTest });
  } catch (error) {
      console.error('Test sonucu kaydedilirken hata:', error);
      res.status(500).json({ message: 'Test sonucu kaydedilirken bir hata oluştu', error });
  }
};

// Test sonucunu getirme
const getUserTest = async (req, res) => {
  const userId = req.user.id;

  try {
      const userTest = await getUserTestByUserId(userId);
      if (!userTest) {
          return res.status(404).json({ message: 'Test sonucu bulunamadı' });
      }

      res.status(200).json({ test: userTest });
  } catch (error) {
      console.error('Test sonucu alınırken hata:', error);
      res.status(500).json({ message: 'Test sonucu alınırken bir hata oluştu', error });
  }
};

// Dışa aktarımlar
module.exports = {
  validateToken,
  verifyToken,
  register,
  login,
  getUsernameByEmail,
  uploadQuestion,
  getUserQuestions,
  updateUserQuestion,
  deleteUserQuestion,
  saveUserTest,
  getUserTest
};
