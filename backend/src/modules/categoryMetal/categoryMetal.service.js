const CategoryMetal = require("./categoryMetal.model");

exports.addMetalToCategory = async (category_id, metal_id) => {
  return await CategoryMetal.create({ category_id, metal_id });
};

exports.removeMetalFromCategory = async (category_id, metal_id) => {
  return await CategoryMetal.deleteOne({ category_id, metal_id });
};

exports.getMetalsByCategory = async (category_id) => {
  const entries = await CategoryMetal.find({ category_id })
    .populate("metal_id")
    .lean();
  return entries.map((e) => e.metal_id);
};

exports.getCategoriesByMetal = async (metal_id) => {
  const entries = await CategoryMetal.find({ metal_id })
    .populate("category_id")
    .lean();
  return entries.map((e) => e.category_id);
};
