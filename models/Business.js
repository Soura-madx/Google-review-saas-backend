const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  cafeName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // bcrypt hashed
  googleReviewLink: { type: String, required: true }, // The exact Google Place link
  themeDetails: {
    primaryColor: { type: String, default: '#000000' }, // For custom QR or UI
    logoUrl: { type: String, default: '' }
  },
  subscriptionStatus: { type: String, default: 'active' }, // free-trial, active, expired
}, { timestamps: true });

module.exports = mongoose.model('Business', businessSchema);