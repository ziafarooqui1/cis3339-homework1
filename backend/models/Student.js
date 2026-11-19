const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  id: { type: String, required: true, trim: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  zip: { type: String, required: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
