const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    receipt: { type: String, },
    expense: { type: Number, required: true },
    date: { type: Date, required: true, unique: true },
  },
  {
      timestamps: true,
  });

module.exports = mongoose.model('expense', expenseSchema);