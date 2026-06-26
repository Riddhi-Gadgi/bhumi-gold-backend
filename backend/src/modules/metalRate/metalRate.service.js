// modules/metalRate/metalRate.service.js
const MetalRate = require("./metalRate.model");
const Metal = require("../metal/metal.model");

exports.getRateHistory = async (metal_id) => {
  try {
    const rates = await MetalRate.find({ metal_id })
      .sort({ effective_date: -1 })
      .lean(); // Use lean() for plain objects

    // Convert Decimal128 to numbers
    return rates.map((rate) => ({
      ...rate,
      rate_per_gram: parseFloat(rate.rate_per_gram.toString()),
    }));
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getLatestRate = async (metal_id) => {
  try {
    const rate = await MetalRate.findOne({ metal_id })
      .sort({ effective_date: -1 })
      .lean();

    if (!rate) return null;

    return {
      ...rate,
      rate_per_gram: parseFloat(rate.rate_per_gram.toString()),
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.createRate = async (data) => {
  try {
    const rate = await MetalRate.create(data);
    return {
      ...rate.toObject(),
      rate_per_gram: parseFloat(rate.rate_per_gram.toString()),
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getLatestRatesForAll = async () => {
  try {
    // Get all active metals using the correct field name: is_active
    const metals = await Metal.find({ is_active: true }).lean();

    // For each metal, fetch the latest rate
    const rates = await Promise.all(
      metals.map(async (metal) => {
        const latest = await MetalRate.findOne({ metal_id: metal._id })
          .sort({ effective_date: -1 })
          .lean();
        return {
          metal_id: metal._id,
          metal_name: metal.metal_name,
          purity: metal.purity,
          rate: latest ? parseFloat(latest.rate_per_gram.toString()) : null,
        };
      }),
    );

    // Return only metals that have a rate
    return rates.filter((r) => r.rate !== null);
  } catch (error) {
    throw new Error(error.message);
  }
};
