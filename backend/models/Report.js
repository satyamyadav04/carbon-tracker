const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    reportType: {
      type: String,
      required: true,
      trim: true,
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    totalCarbonKg: {
      type: Number,
      required: true,
    },
    activityCount: {
      type: Number,
      required: true,
    },
    pdfPath: {
      type: String,
      required: true,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailTo: {
      type: String,
      trim: true,
    },
    emailSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Report', reportSchema);
