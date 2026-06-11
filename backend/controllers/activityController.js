const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const { calculateCarbonEmission } = require('../utils/carbonCalculator');

const createActivity = async (req, res, next) => {
  try {
    const { title, activityType, amount, unit, notes, date } = req.body;

    if (!title || !activityType || amount === undefined || amount === null || !unit) {
      res.status(400);
      throw new Error('Title, activityType, amount, and unit are required');
    }

    const emissionPayload = calculateCarbonEmission({
      activityType,
      amount,
      unit,
    });

    const activity = await Activity.create({
      user: req.user.id,
      title,
      activityType: emissionPayload.activityType,
      amount: emissionPayload.amount,
      unit: emissionPayload.unit,
      carbonEmissionKg: emissionPayload.carbonEmissionKg,
      notes,
      date: date ? new Date(date) : undefined,
    });

    res.status(201).json(activity);
  } catch (error) {
    next(error);
  }
};

const getActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(activities);
  } catch (error) {
    next(error);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const total = await Activity.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalCarbonKg: { $sum: '$carbonEmissionKg' },
          activityCount: { $sum: 1 },
        },
      },
    ]);

    const breakdown = await Activity.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$activityType',
          carbonKg: { $sum: '$carbonEmissionKg' },
          count: { $sum: 1 },
        },
      },
      { $sort: { carbonKg: -1 } },
    ]);

    const recentActivities = await Activity.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({
      totalCarbonKg: total[0]?.totalCarbonKg || 0,
      activityCount: total[0]?.activityCount || 0,
      breakdown,
      recentActivities,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createActivity,
  getActivities,
  getDashboard,
};
