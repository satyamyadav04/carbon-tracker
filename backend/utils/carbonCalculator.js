const ACTIVITY_FACTORS = {
  driving: 0.192, // kg CO2e per km
  flight: 0.255, // kg CO2e per km
  electricity: 0.417, // kg CO2e per kWh
  public_transport: 0.045, // kg CO2e per km
  cycling: 0.0,
  walking: 0.0,
  food: 2.5, // kg CO2e per serving/kg equivalent
  other: 0.1,
};

const normalizeType = (activityType) => {
  if (!activityType) return 'other';
  const normalized = activityType.toLowerCase().replace(/\s+/g, '_');
  return ACTIVITY_FACTORS[normalized] ? normalized : 'other';
};

const calculateCarbonEmission = ({ activityType, amount, unit }) => {
  const type = normalizeType(activityType);
  const numericAmount = Number(amount);

  if (Number.isNaN(numericAmount) || numericAmount < 0) {
    throw new Error('Invalid numeric activity amount');
  }

  const factor = ACTIVITY_FACTORS[type] ?? ACTIVITY_FACTORS.other;
  const emission = numericAmount * factor;

  return {
    activityType: type,
    amount: numericAmount,
    unit: unit || 'unit',
    carbonEmissionKg: Number(emission.toFixed(3)),
  };
};

module.exports = {
  calculateCarbonEmission,
  ACTIVITY_FACTORS,
};
