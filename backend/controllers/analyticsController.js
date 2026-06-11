const mongoose = require('mongoose');
const Activity = require('../models/Activity');

const toDateKey = (date) => date.toISOString().slice(0, 10);

const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getDateRange = (days) => {
  const end = getStartOfDay(new Date());
  const start = new Date(end);
  start.setDate(end.getDate() - (days - 1));
  return { start, end };
};

const getTotalCarbon = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const totals = await Activity.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalCarbonKg: { $sum: '$carbonEmissionKg' },
          activityCount: { $sum: 1 },
          averageCarbonKg: { $avg: '$carbonEmissionKg' },
        },
      },
    ]);

    const result = totals[0] || { totalCarbonKg: 0, activityCount: 0, averageCarbonKg: 0 };
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getEmissionByWindow = async (req, res, next) => {
  try {
    const { days, label } = req.params;
    const windowDays = Number(days);
    if (Number.isNaN(windowDays) || windowDays <= 0) {
      res.status(400);
      throw new Error('Invalid window size');
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { start, end } = getDateRange(windowDays);
    const endInclusive = new Date(end);
    endInclusive.setDate(endInclusive.getDate() + 1);

    const aggregates = await Activity.aggregate([
      { $match: { user: userId, date: { $gte: start, $lt: endInclusive } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' },
          },
          carbonKg: { $sum: '$carbonEmissionKg' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    const timeline = [];
    for (let idx = 0; idx < windowDays; idx += 1) {
      const current = new Date(start);
      current.setDate(start.getDate() + idx);
      const key = toDateKey(current);
      const found = aggregates.find((item) => {
        const dateStr = `${item._id.year.toString().padStart(4, '0')}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`;
        return dateStr === key;
      });

      timeline.push({
        date: key,
        carbonKg: found ? Number(found.carbonKg.toFixed(3)) : 0,
        activityCount: found ? found.count : 0,
      });
    }

    res.json({ window: label, timeline });
  } catch (error) {
    next(error);
  }
};

const getPieChartData = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

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

    const totalCarbon = breakdown.reduce((sum, item) => sum + item.carbonKg, 0);
    const values = breakdown.map((item) => ({
      activityType: item._id,
      carbonKg: Number(item.carbonKg.toFixed(3)),
      count: item.count,
      percentage: totalCarbon > 0 ? Number(((item.carbonKg / totalCarbon) * 100).toFixed(1)) : 0,
    }));

    res.json({ totalCarbonKg: Number(totalCarbon.toFixed(3)), values });
  } catch (error) {
    next(error);
  }
};

const getSustainabilityScore = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const userStats = await Activity.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalCarbonKg: { $sum: '$carbonEmissionKg' },
          activityCount: { $sum: 1 },
          greenActivityCount: {
            $sum: {
              $cond: [
                { $in: ['$activityType', ['walking', 'cycling', 'public_transport']] },
                1,
                0,
              ],
            },
          },
          zeroEmissionCount: {
            $sum: {
              $cond: [{ $eq: ['$carbonEmissionKg', 0] }, 1, 0] },
          },
        },
      },
    ]);

    const stats = userStats[0] || { totalCarbonKg: 0, activityCount: 0, greenActivityCount: 0, zeroEmissionCount: 0 };
    const greenRatio = stats.activityCount ? stats.greenActivityCount / stats.activityCount : 0;
    const zeroEmissionRatio = stats.activityCount ? stats.zeroEmissionCount / stats.activityCount : 0;
    const rawScore = 75 - Math.min(50, stats.totalCarbonKg / Math.max(1, stats.activityCount)) + greenRatio * 15 + zeroEmissionRatio * 10;
    const score = Math.max(0, Math.min(100, Number(rawScore.toFixed(1))));

    res.json({
      sustainabilityScore: score,
      totalCarbonKg: Number(stats.totalCarbonKg.toFixed(3)),
      activityCount: stats.activityCount,
      greenActivityCount: stats.greenActivityCount,
      zeroEmissionCount: stats.zeroEmissionCount,
      greenRatio: Number((greenRatio * 100).toFixed(1)),
      zeroEmissionRatio: Number((zeroEmissionRatio * 100).toFixed(1)),
      grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
    });
  } catch (error) {
    next(error);
  }
};

const getLeaderboard = async (req, res, next) => {
  try {
    const currentUserId = new mongoose.Types.ObjectId(req.user.id);

    const topUsers = await Activity.aggregate([
      {
        $group: {
          _id: '$user',
          totalCarbonKg: { $sum: '$carbonEmissionKg' },
          activityCount: { $sum: 1 },
        },
      },
      { $sort: { totalCarbonKg: 1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          name: '$user.name',
          email: '$user.email',
          totalCarbonKg: { $round: ['$totalCarbonKg', 3] },
          activityCount: 1,
        },
      },
    ]);

    const currentTotal = await Activity.aggregate([
      { $match: { user: currentUserId } },
      {
        $group: {
          _id: '$user',
          totalCarbonKg: { $sum: '$carbonEmissionKg' },
        },
      },
    ]);

    const currentCarbon = currentTotal[0]?.totalCarbonKg ?? null;
    let currentRank = null;

    if (currentCarbon !== null) {
      const betterCount = await Activity.aggregate([
        {
          $group: {
            _id: '$user',
            totalCarbonKg: { $sum: '$carbonEmissionKg' },
          },
        },
        { $match: { totalCarbonKg: { $lt: currentCarbon } } },
        { $count: 'rank' },
      ]);
      currentRank = (betterCount[0]?.rank ?? 0) + 1;
    }

    res.json({ topUsers, currentUser: { totalCarbonKg: currentCarbon, rank: currentRank } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTotalCarbon,
  getEmissionByWindow,
  getPieChartData,
  getSustainabilityScore,
  getLeaderboard,
};
