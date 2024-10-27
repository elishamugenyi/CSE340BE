// reviewModel.js
const pool = require("../database/")

// Add a new review
async function addReview(user_id, item_id, rating, comment) {
  const query = `
    INSERT INTO reviews (user_id, item_id, rating, comment)
    VALUES ($1, $2, $3, $4) RETURNING *;
  `;
  const values = [user_id, item_id, rating, comment];
  const result = await pool.query(query, values);
  return result.rows[0];
}

// Retrieve all reviews for a specific item
async function getReviewsByItem(item_id) {
  const query = `
    SELECT r.*, CONCAT(a.account_firstname, '', a.account_lastname) AS full_name
    FROM reviews r
    JOIN account a ON r.user_id = a.account_id
    WHERE r.item_id = $1 
    ORDER BY r.created_at DESC;
  `;
  const result = await pool.query(query, [item_id]);
  return result.rows;
}
module.exports = {
    addReview,
    getReviewsByItem
}