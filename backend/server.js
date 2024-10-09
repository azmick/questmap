const express = require('express');
const authRoutes = require('./routes/authRoutes'); // authRoutes'i dahil et
const questBotRoutes = require('./routes/questBotRoutes')
const cors = require('cors')

const app = express();

app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.use(cors());

// Kullanıcı oturum işlemleri için yönlendirme
app.use('/auth', authRoutes);
app.use('/questbot', questBotRoutes);

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
