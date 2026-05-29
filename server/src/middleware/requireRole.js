export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    if (req.user.role !== requiredRole && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    next()
  }
}
