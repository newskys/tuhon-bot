const mongoose = require('mongoose');

const escapeRoomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true, unique: true },
    brand: { type: String },
    location: { type: String, },
  },
  {
      timestamps: true,
  });

module.exports = mongoose.model('EscapeRoom', escapeRoomSchema);