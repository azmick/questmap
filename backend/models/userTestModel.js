const pool = require('../config/db');

// Yeni bir test sonucu oluşturma
const createUserTest = async (userId, result) => {
    const query = `INSERT INTO public.user_tests (user_id, result) VALUES ($1, $2) RETURNING *`;
    const values = [userId, result];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

// Kullanıcıya ait test sonucunu getirme
const getUserTestByUserId = async (userId) => {
    const query = `SELECT * FROM public.user_tests WHERE user_id = $1`;
    const { rows } = await pool.query(query, [userId]);
    return rows[0];
};

module.exports = {
    createUserTest,
    getUserTestByUserId,
};
