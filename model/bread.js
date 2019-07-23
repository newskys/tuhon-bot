const mongoose = require('mongoose');

const breadSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true, unique: true },
  },
  {
      timestamps: true,
  });

breadSchema.statics.findAll = () => this.find({});
breadSchema.statics.create = function(payload) {
    const bread = new this(payload);
    return bread.save();
}
breadSchema.statics.findOneByDate = (date) => this.findOne({ date });
breadSchema.statics.deleteOneByDate = (date) => this.remove({ date });

module.exports = mongoose.model('Bread', breadSchema);