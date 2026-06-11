const adminMiddleware = (req, res, next) => {
  if (!req.user?.isAdmin) {
    res.status(403);
    return next(new Error('Admin access required'));
  }
  next();
};

module.exports = adminMiddleware;
