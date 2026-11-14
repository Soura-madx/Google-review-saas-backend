const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  // Naye users ke liye
  businessName: { type: String }, 
  businessCategory: { type: String, default: 'cafe' },
  
  // Purane users ki compatibility ke liye (required hata diya hai)
  cafeName: { type: String }, 
  
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // bcrypt hashed
  googleReviewLink: { type: String, required: true },
  themeDetails: {
    primaryColor: { type: String, default: '#000000' },
    logoUrl: { type: String, default: '' }
  },
  subscriptionStatus: { type: String, default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Business', businessSchema);