'use strict';

const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { sendError } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_pharma_key_2026';

/**
 * Roles are stored in Postgres as ADMIN / DISTRIBUTOR_STAFF / PHARMACY_STAFF,
 * but the frontend routes are written in terms of ADMIN / DISTRIBUTOR / PHARMACY.
 * Normalise both directions so either spelling works in requireRole().
 */
function normalizeRole(role) {
  if (role === 'DISTRIBUTOR_STAFF') return 'DISTRIBUTOR';
  if (role === 'PHARMACY_STAFF') return 'PHARMACY';
  return role;
}

function roleMatches(userRole, allowed) {
  return allowed.some((r) => r === userRole || r === normalizeRole(userRole));
}

function extractToken(req) {
  const header = req.headers['authorization'] || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  if (req.headers['x-access-token']) return String(req.headers['x-access-token']);
  if (req.query && req.query.token) return String(req.query.token);
  return null;
}

async function loadUser(userId) {
  const result = await db.query(
    `SELECT u.id, u.name, u.email, u.role, u.status, u.organization_id,
            o.name AS organization_name, o.type AS organization_type
     FROM users u
     LEFT JOIN organizations o ON u.organization_id = o.id
     WHERE u.id = $1`,
    [userId]
  );
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  if (row.status !== 'ACTIVE') return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: normalizeRole(row.role),
    rawRole: row.role,
    status: row.status,
    organizationId: row.organization_id,
    organizationName: row.organization_name,
    organizationType: row.organization_type,
  };
}

/** Verifies the JWT and attaches the fresh DB user to req.user. */
async function authenticateToken(req, res, next) {
  const token = extractToken(req);
  if (!token) return sendError(res, 401, 'UNAUTHORIZED', 'Authentication token required');

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return sendError(res, 401, 'INVALID_TOKEN', 'Session expired or invalid. Please log in again.');
  }

  try {
    const user = await loadUser(decoded.id);
    if (!user) return sendError(res, 401, 'UNAUTHORIZED', 'User account is not active');
    req.user = user;
    return next();
  } catch (err) {
    return sendError(res, 500, 'AUTH_ERROR', 'Could not validate the session');
  }
}

/** Attaches req.user when a valid token is present; never rejects the request. */
async function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await loadUser(decoded.id);
    if (user) req.user = user;
  } catch (_) {
    // ignore — public access
  }
  return next();
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
    if (!roleMatches(req.user.role, allowedRoles)) {
      return sendError(
        res,
        403,
        'FORBIDDEN',
        `Role ${req.user.role} is not allowed to perform this action`
      );
    }
    return next();
  };
}

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: normalizeRole(user.role),
      organizationId: user.organization_id || user.organizationId || null,
    },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
}

module.exports = { authenticateToken, optionalAuth, requireRole, signToken, normalizeRole, JWT_SECRET };
