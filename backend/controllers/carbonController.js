const CarbonRecord = require('../models/CarbonRecord');

const getRecords = async (req, res, next) => {
  try {
    const records = await CarbonRecord.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    next(error);
  }
};

const createRecord = async (req, res, next) => {
  try {
    const { name, value, category } = req.body;

    const record = await CarbonRecord.create({
      name,
      value,
      category,
    });

    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecords,
  createRecord,
};
