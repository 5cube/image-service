const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

const imageSchema = mongoose.Schema({
  imageId: { type: Number, require: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['created', 'published', 'deleted'],
    default: 'created'
  },
  name: { type: String },
  type: { type: String },
  path: { type: String }
});

imageSchema.plugin(autoIncrement.plugin, { model: 'Image', field: 'imageId' });

imageSchema.pre('update', function () {
  this.update({}, { $set: { updatedAt: new Date() } });
});

module.exports = mongoose.model('Image', imageSchema);
