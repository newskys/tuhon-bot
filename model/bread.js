const mongoose = require('mongoose');

const breadSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true, unique: true },
  },
  {
      timestamps: true,
  });

breadSchema.statics.findAll = function() { this.find({}); }
breadSchema.statics.create = function(payload) { new this(payload).save(); }
breadSchema.statics.findOneByDate = function(date) { this.findOne({ date }); }
breadSchema.statics.deleteOneByDate = function(date) { this.remove({ date }); }

module.exports = mongoose.model('Bread', breadSchema);