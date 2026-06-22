/**
 * Simple bearer-token guard for admin endpoints.
 * Set ADMIN_API_TOKEN in the environment and send it as either:
 *   Authorization: Bearer <token>      or      x-admin-token: <token>
 *
 * If ADMIN_API_TOKEN is not configured, admin routes are locked down
 * (fail closed) rather than left open.
 */
const adminAuth = (req, res, next) => {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) {
    return res.status(503).json({ success: false, message: 'Admin API not configured.' });
  }

  const header = req.get('authorization') || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const provided = bearer || req.get('x-admin-token') || '';

  if (provided && provided === expected) return next();
  return res.status(401).json({ success: false, message: 'Unauthorized.' });
};

module.exports = adminAuth;
