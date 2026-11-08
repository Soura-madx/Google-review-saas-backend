const Business = require('../models/Business');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
const registerBusiness = async (req, res) => {
  const { cafeName, email, password, googleReviewLink } = req.body;

  try {
    // Check if business already exists
    const businessExists = await Business.findOne({ email });
    if (businessExists) {
      return res.status(400).json({ message: 'Business with this email already exists' });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create Business
    const business = await Business.create({
      cafeName,
      email,
      password: hashedPassword,
      googleReviewLink,
    });

    if (business) {
      res.status(201).json({
        _id: business.id,
        cafeName: business.cafeName,
        email: business.email,
        googleReviewLink: business.googleReviewLink,
        token: generateToken(business._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST /api/auth/login
const loginBusiness = async (req, res) => {
  const { email, password } = req.body;

  try {
    const business = await Business.findOne({ email });

    // Check password match
    if (business && (await bcrypt.compare(password, business.password))) {
      res.json({
        _id: business.id,
        cafeName: business.cafeName,
        email: business.email,
        googleReviewLink: business.googleReviewLink,
        token: generateToken(business._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { registerBusiness, loginBusiness };