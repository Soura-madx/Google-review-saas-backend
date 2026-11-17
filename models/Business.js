const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  businessName: { type: String }, 
  businessCategory: { type: String, default: 'cafe' },
  cafeName: { type: String }, 
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  googleReviewLink: { type: String, required: true },
  
  // 🌟 NAYA FEATURE: Trapdoor toggle flag (Default true rahega)
  enableTrapdoor: { type: Boolean, default: true },

  themeDetails: {
    primaryColor: { type: String, default: '#000000' },
    logoUrl: { type: String, default: '' }
  },
  subscriptionStatus: { type: String, default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Business', businessSchema);