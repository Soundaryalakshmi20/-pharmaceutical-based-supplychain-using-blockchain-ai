'use strict';

const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { ApiError } = require('../utils/response');
const { signToken, normalizeRole } = require('../middleware/auth');
const auditService = require('./auditService');

function toPublicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: normalizeRole(row.role),
    rawRole: row.role,
    organizationId: row.organization_id || null,
    organizationName: row.organization_name || null,
    organizationType: row.organization_type || null,
    status: row.status,
  };
}

const SELECT_USER = `
  SELECT u.*, o.name AS organization_name, o.type AS organization_type
  FROM users u
  LEFT JOIN organizations o ON u.organization_id = o.id`;

class AuthService {
  async login({ email, password }, meta = {}) {
    if (!email || !password) throw new ApiError(400, 'MISSING_CREDENTIALS', 'Email and password are required');

    const result = await db.query(`${SELECT_USER} WHERE LOWER(u.email) = LOWER($1)`, [email.trim()]);
    if (result.rows.length === 0) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

    const user = result.rows[0];
    if (user.status !== 'ACTIVE') throw new ApiError(403, 'ACCOUNT_DISABLED', 'This account has been disabled');

    let valid = false;
    try {
      valid = bcrypt.compareSync(password, user.password_hash);
    } catch (_) {
      valid = false;
    }
    if (!valid) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

    const token = signToken(user);
    const publicUser = toPublicUser(user);

    auditService.log({
      userId: user.id,
      organizationId: user.organization_id,
      action: 'LOGIN',
      entityType: 'user',
      entityId: user.id,
      details: { email: user.email },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return { token, user: publicUser };
  }

  async getMe(userId) {
    const result = await db.query(`${SELECT_USER} WHERE u.id = $1`, [userId]);
    if (result.rows.length === 0) throw new ApiError(401, 'UNAUTHORIZED', 'User not found');
    return toPublicUser(result.rows[0]);
  }
}

module.exports = new AuthService();
