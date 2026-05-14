const { pool } = require("../config/db");

async function findByEmail(email) {
  const query = `
    SELECT u.id, u.full_name, u.bio, u.email, u.password_hash, u.is_verified,
           u.created_at, u.updated_at, r.name AS role
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.email = $1
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
}

async function findById(id) {
  const query = `
    SELECT u.id, u.full_name, u.bio, u.email, u.created_at, u.updated_at, r.name AS role
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

async function findByVerificationToken(token) {
  const query = `
    SELECT id, full_name, email, is_verified, verification_token_expires_at
    FROM users
    WHERE verification_token = $1
  `;
  const result = await pool.query(query, [token]);
  return result.rows[0] || null;
}

async function createUser({ fullName, bio = "", email, passwordHash, roleId, verificationToken, verificationTokenExpiresAt }) {
  const query = `
    INSERT INTO users (full_name, bio, email, password_hash, role_id, verification_token, verification_token_expires_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, full_name, bio, email, created_at, updated_at
  `;
  const result = await pool.query(query, [fullName, bio, email, passwordHash, roleId, verificationToken, verificationTokenExpiresAt]);
  return result.rows[0];
}

async function markVerified(userId) {
  const query = `
    UPDATE users
    SET is_verified = true, verification_token = null, verification_token_expires_at = null, updated_at = NOW()
    WHERE id = $1
  `;
  await pool.query(query, [userId]);
}

async function updateVerificationToken(userId, token, expiresAt) {
  const query = `
    UPDATE users
    SET verification_token = $1, verification_token_expires_at = $2, updated_at = NOW()
    WHERE id = $3
  `;
  await pool.query(query, [token, expiresAt, userId]);
}

async function updateUserProfile(id, { fullName, bio }) {
  const query = `
    UPDATE users
    SET full_name = $1, bio = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING id, full_name, bio, email, created_at, updated_at
  `;
  const result = await pool.query(query, [fullName, bio, id]);
  return result.rows[0] || null;
}

async function updateUserPassword(id, passwordHash) {
  const query = `
    UPDATE users
    SET password_hash = $1, updated_at = NOW()
    WHERE id = $2
  `;
  await pool.query(query, [passwordHash, id]);
}

module.exports = {
  findByEmail,
  findById,
  findByVerificationToken,
  createUser,
  markVerified,
  updateVerificationToken,
  updateUserProfile,
  updateUserPassword
};
