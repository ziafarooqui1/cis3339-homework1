const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  id: { type: String, required: [true, 'Student ID is required'], trim: true, unique: true, index: true },
  name: { type: String, required: [true, 'Student name is required'], trim: true },
  phone: { type: String, required: [true, 'Phone number is required'], trim: true },
  zip: { type: String, required: [true, 'ZIP code is required'], trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
