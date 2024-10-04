const pool = require('../config/db');

const createQuestion = async (questionData) => {
  const { user_id, lesson, topic, images } = questionData;
  const result = await pool.query(
    `INSERT INTO questions (user_id, lesson, topic, images) VALUES ($1, $2, $3, $4) RETURNING *`,
    [user_id, lesson, topic, images]
  );
  return result.rows[0];
};

const getUserQuestions = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM questions WHERE user_id = $1`,
    [userId]
  );
  return result.rows;
};

const updateQuestion = async (questionId, updatedData) => {
  const { lesson, topic, description } = updatedData;
  const result = await pool.query(
    `UPDATE questions SET lesson = $1, topic = $2, description = $3 WHERE id = $4 RETURNING *`,
    [lesson, topic, description, questionId]
  );
  return result.rows[0];
};

const deleteQuestion = async (questionId) => {
  const result = await pool.query(
    `DELETE FROM questions WHERE id = $1 RETURNING *`,
    [questionId]
  );
  return result.rows[0];
};

module.exports = { createQuestion, getUserQuestions, updateQuestion, deleteQuestion };
