const mongoose = require('mongoose');

const carbonRecordSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CarbonRecord', carbonRecordSchema);
