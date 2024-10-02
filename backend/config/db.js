const { Pool } = require('pg');
require('dotenv').config();

// Şifreyi konsolda yazdırıyoruz
console.log("DB Password: ", process.env.DB_PASS);

// Şifre boşsa hata fırlatıyoruz
if (!process.env.DB_PASS) {
    throw new Error("Veritabanı şifresi ayarlanmamış!");
}

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,  // Şifreyi buradan alıyoruz
    port: process.env.DB_PORT
});

module.exports = pool;
