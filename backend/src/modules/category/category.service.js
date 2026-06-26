const Category = require("./category.model");
const CategoryMetal = require("../categoryMetal/categoryMetal.model");

exports.createCategory = async (data) => {
  try {
    const category = await Category.create(data);
    if (data.metals && Array.isArray(data.metals)) {
      const metalEntries = data.metals.map((metal_id) => ({
        category_id: category._id,
        metal_id,
      }));
      await CategoryMetal.insertMany(metalEntries);
    }
    return category;
  } catch (error) {
    console.error("Error in createCategory service:", error);
    throw new Error(error.message);
  }
};

exports.getAllCategories = async (filter = {}) => {
  return await Category.find(filter).lean();
};

exports.getCategoryById = async (id) => {
  const category = await Category.findById(id).lean();
  if (category) {
    // Fetch allowed metals
    const metals = await CategoryMetal.find({ category_id: id })
      .select("metal_id")
      .lean();
    category.metals = metals.map((m) => m.metal_id);
  }
  return category;
};

exports.updateCategory = async (id, data) => {
  const category = await Category.findByIdAndUpdate(id, data, {
    new: true,
  }).lean();
  // Update metals if provided
  if (data.metals && Array.isArray(data.metals)) {
    await CategoryMetal.deleteMany({ category_id: id });
    const metalEntries = data.metals.map((metal_id) => ({
      category_id: id,
      metal_id,
    }));
    await CategoryMetal.insertMany(metalEntries);
  }
  return category;
};

exports.toggleCategoryStatus = async (id) => {
  const category = await Category.findById(id);
  if (!category) throw new Error("Category not found");
  category.is_active = !category.is_active;
  await category.save();
  return category;
};

exports.deleteCategory = async (id) => {
  // Check if any product uses this category
  const Product = require("../product/product.model");
  const productCount = await Product.countDocuments({ category_id: id });
  if (productCount > 0) {
    throw new Error("Cannot delete category with existing products");
  }
  await CategoryMetal.deleteMany({ category_id: id });
  await Category.findByIdAndDelete(id);
  return { message: "Category deleted" };
};
