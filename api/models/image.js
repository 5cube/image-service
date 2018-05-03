const mongoose = require('mongoose');

const counterSchema = mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});
const counter = mongoose.model('counter', counterSchema);

const imageSchema = mongoose.Schema({
  imageId: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: [
      'created',
      'updated',
      'deleted'
    ],
    default: 'created'
  },
  filename: String,
  originalname: String,
  mimetype: {
    type: String,
    enum: [
      'image/gif',
      'image/jpeg',
      'image/pjpeg',
      'image/png',
      'image/svg+xml',
      'image/tiff',
      'image/vnd.microsoft.icon',
      'image/vnd.wap.wbmp',
      'image/webp'
    ],
    default: 'image/jpeg'
  },
  path: { type: String }
});

imageSchema.pre('update', function () {
  this.update({}, { $set: { updatedAt: new Date(), status: 'updated' } });
});

imageSchema.pre('save', function (next) {
  const doc = this;
  counter.findByIdAndUpdate(
    { _id: 'imageId' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
    function (error, counter) {
      if (error) {
        return next(error);
      }
      doc.imageId = counter.seq;
      next();
    }
  );
});

module.exports = mongoose.model('Image', imageSchema);
