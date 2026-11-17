const Business = require('../models/Business');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
const registerBusiness = async (req, res) => {
  const { businessName, businessCategory, cafeName, email, password, googleReviewLink, enableTrapdoor } = req.body;

  try {
    const businessExists = await Business.findOne({ email });
    if (businessExists) {
      return res.status(400).json({ message: 'Business with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const finalName = businessName || cafeName; 

    // 🌟 Trapdoor value save karna (agar undefined ho toh true maan lo)
    const trapdoorSetting = enableTrapdoor !== undefined ? enableTrapdoor : true;

    const business = await Business.create({
      businessName: finalName,
      cafeName: finalName, 
      businessCategory: businessCategory || 'cafe',
      email,
      password: hashedPassword,
      googleReviewLink,
      enableTrapdoor: trapdoorSetting,
    });

    if (business) {
      res.status(201).json({
        _id: business.id,
        businessName: business.businessName,
        businessCategory: business.businessCategory,
        email: business.email,
        googleReviewLink: business.googleReviewLink,
        enableTrapdoor: business.enableTrapdoor,
        token: generateToken(business._id),
      });
    }
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST /api/auth/login
const loginBusiness = async (req, res) => {
  const { email, password } = req.body;

  try {
    const business = await Business.findOne({ email });

    if (business && (await bcrypt.compare(password, business.password))) {
      res.json({
        _id: business.id,
        businessName: business.businessName || business.cafeName,
        businessCategory: business.businessCategory || 'cafe',
        email: business.email,
        googleReviewLink: business.googleReviewLink,
        enableTrapdoor: business.enableTrapdoor,
        token: generateToken(business._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error("Server error", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/business/toggle-trapdoor (Dashboard se toggle change karne ke liye)
const updateTrapdoorSetting = async (req, res) => {
  try {
    const { enableTrapdoor } = req.body;
    const businessId = req.business._id; // Auth middleware se milega

    const updatedBusiness = await Business.findByIdAndUpdate(
      businessId,
      { enableTrapdoor },
      { new: true }
    );

    res.status(200).json({
      success: true,
      enableTrapdoor: updatedBusiness.enableTrapdoor,
      message: "Trapdoor setting updated successfully!"
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update setting', error: error.message });
  }
};

module.exports = { registerBusiness, loginBusiness, updateTrapdoorSetting };