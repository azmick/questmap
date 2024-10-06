const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { createUser, findUserByEmail} = require('../models/userModel');
const { createQuestion, updateQuestion, deleteQuestion } = require('../models/questionModel');
const pool = require('../config/db');


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

// Register Error Handling
exports.register = async (req, res) => {
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


// Giriş
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

    res.json({ message: 'Login successful', token, nickname: user.nickname, userId: user.id });
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

exports.uploadQuestion = async (req, res) => {
  try {
    const { lesson, topic, title, description } = req.body;  // Gelen ders ve konu bilgilerini alıyoruz
    const image = req.file;  // Resim dosyasını multer ile alıyoruz
    const userId = req.user.id;  // JWT'den doğrulanmış kullanıcı ID'si
  
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
exports.getUserQuestions = async (req, res) => {
  const userId = req.user.id; // JWT'den doğrulanmış kullanıcı ID'si
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
  
  // Soru güncelleme
exports.updateQuestion = async (req, res) => {
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


  // Soru silme
exports.deleteQuestion = async (req, res) => {
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
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];  // 'Bearer <token>' formatından token'ı alıyoruz

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Token'ı doğruluyoruz
    req.user = decoded;  // Kullanıcıyı request'e ekliyoruz
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};
  


