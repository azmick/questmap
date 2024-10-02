const pool = require('../config/db');

const createUser = async (userData) => {
    const { nickname, email, password } = userData;
    const result = await pool.query(
        `INSERT INTO users (nickname, email, password) VALUES ($1, $2, $3) RETURNING *`,
        [nickname, email, password]
    );
    return result.rows[0];
};

const findUserByEmail = async (email) => {
    const result = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
    );
    return result.rows[0];
};

module.exports = { createUser, findUserByEmail };
