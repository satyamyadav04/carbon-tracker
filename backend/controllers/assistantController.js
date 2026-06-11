const mongoose = require('mongoose');
const Activity = require('../models/Activity');
// const { invokeGemini } = require('../utils/geminiClient');
const { invokeGrok } = require('../utils/grokClient');

const buildActivitySummary = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const aggregation = await Activity.aggregate([
    { $match: { user: userObjectId } },
    {
      $group: {
        _id: '$activityType',
        carbonKg: { $sum: '$carbonEmissionKg' },
        count: { $sum: 1 },
      },
    },
  ]);

  const total = aggregation.reduce(
    (acc, item) => ({
      carbonKg: acc.carbonKg + item.carbonKg,
      activityCount: acc.activityCount + item.count,
    }),
    { carbonKg: 0, activityCount: 0 }
  );

  return {
    totalCarbonKg: Number(total.carbonKg.toFixed(3)),
    activityCount: total.activityCount,
    breakdown: aggregation.map((item) => ({
      activityType: item._id,
      carbonKg: Number(item.carbonKg.toFixed(3)),
      count: item.count,
    })),
  };
};

const createAssistantPrompt = (summary, type, userMessage = '') => {
  const base = [];
  base.push('You are an AI Sustainability Assistant for a carbon-tracking app.');
  base.push('Provide friendly, actionable, and personalized guidance to help the user reduce carbon emissions.');
  base.push('Do not mention the API implementation details. Keep the response short and practical.');

  base.push(`User summary:\n- Total carbon emitted: ${summary.totalCarbonKg} kg\n- Total activities: ${summary.activityCount}`);
  if (summary.breakdown.length) {
    base.push('Breakdown by activity type:');
    summary.breakdown.forEach((item) => {
      base.push(`- ${item.activityType}: ${item.carbonKg} kg from ${item.count} activities`);
    });
  }

  switch (type) {
    case 'recommendations':
      base.push('Create 4 personalized carbon reduction recommendations based on this activity profile.');
      base.push('Also include 2 practical sustainability tips for the coming month.');
      break;
    case 'monthly-analysis':
      base.push('Generate a monthly sustainability analysis summary with strengths and top areas for improvement.');
      base.push('Provide a simple action plan for the next 30 days.');
      break;
    case 'chat':
      base.push(`User asked: ${userMessage}`);
      base.push('Respond as a helpful sustainability coach.');
      break;
    default:
      base.push('Provide a helpful sustainability response.');
      break;
  }

  return base.join('\n');
};

const getRecommendations = async (req, res, next) => {
  try {
    const summary = await buildActivitySummary(req.user.id);
    const prompt = createAssistantPrompt(summary, 'recommendations');
    const answer = await invokeGrok(prompt, { temperature: 0.6, maxOutputTokens: 450 });
    res.json({ summary, recommendations: answer.trim() });
  } catch (error) {
    next(error);
  }
};

const getMonthlyAnalysis = async (req, res, next) => {
  try {
    const summary = await buildActivitySummary(req.user.id);
    const prompt = createAssistantPrompt(summary, 'monthly-analysis');
    const answer = await invokeGrok(prompt, { temperature: 0.65, maxOutputTokens: 450 });
    res.json({ summary, analysis: answer.trim() });
  } catch (error) {
    next(error);
  }
};

const chatAssistant = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400);
      throw new Error('Message is required for AI chat');
    }

    const summary = await buildActivitySummary(req.user.id);
    const prompt = createAssistantPrompt(summary, 'chat', message);
    const answer = await invokeGrok(prompt, { temperature: 0.8, maxOutputTokens: 450 });

    res.json({ response: answer.trim() });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
  getMonthlyAnalysis,
  chatAssistant,
};
