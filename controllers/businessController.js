const Business = require('../models/Business');

// @route   GET /api/business/profile
// @access  Private (Owner Dashboard ke liye)
const getBusinessProfile = async (req, res) => {
  // Middleware ne already req.business me data daal diya hai
  res.status(200).json(req.business);
};

// @route   GET /api/business/public/:id
// @access  Public (Customer QR scan karne ke baad call karega)
const getPublicBusinessInfo = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id).select('cafeName googleReviewLink');
    
    if (business) {
      res.status(200).json(business);
    } else {
      res.status(404).json({ message: 'Business not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Invalid ID or Server Error' });
  }
};

module.exports = { getBusinessProfile, getPublicBusinessInfo };