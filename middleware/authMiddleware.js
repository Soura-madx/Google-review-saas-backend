const jwt = require('jsonwebtoken');
const Business = require('../models/Business');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Token extract karein ("Bearer token123" me se)
      token = req.headers.authorization.split(' ')[1];

      // Token verify karein
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Decoded ID se business find karein aur password field ko exclude kar dein
      req.business = await Business.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };