const mongoose = require('mongoose');

const scanLogSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  selectedTag: { type: String, required: true }, // e.g., "Great Vibe", "Delicious Food"
  aiGeneratedText: { type: String },
  copiedToClipboard: { type: Boolean, default: false } // To track conversion
}, { timestamps: true });

module.exports = mongoose.model('ScanLog', scanLogSchema);