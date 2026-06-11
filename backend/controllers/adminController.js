const mongoose = require('mongoose');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Report = require('../models/Report');

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('name email createdAt isAdmin');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getAdminSummary = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalActivities = await Activity.countDocuments();
    const totalReports = await Report.countDocuments();

    const carbonStats = await Activity.aggregate([
      {
        $group: {
          _id: null,
          totalCarbonKg: { $sum: '$carbonEmissionKg' },
          averageCarbonKg: { $avg: '$carbonEmissionKg' },
        },
      },
    ]);

    const currentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt isAdmin');
    const recentReports = await Report.find().sort({ createdAt: -1 }).limit(5).select('title reportType totalCarbonKg emailSent createdAt');

    res.json({
      totalUsers,
      totalActivities,
      totalReports,
      totalCarbonKg: carbonStats[0]?.totalCarbonKg || 0,
      averageCarbonKg: carbonStats[0]?.averageCarbonKg || 0,
      currentUsers,
      recentReports,
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.isAdmin = Boolean(isAdmin);
    await user.save();

    res.json({ message: 'User role updated', user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getAdminSummary,
  updateUserRole,
};
