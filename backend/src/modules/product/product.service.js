// product.service.js
const Product = require("./product.model");
const MetalRate = require("../metalRate/metalRate.model");

// Helper to get dynamic price using latest rate (returns precise number)
async function getDynamicPrice(product) {
  const latestRate = await MetalRate.findOne({ metal_id: product.metal_id })
    .sort({ effective_date: -1 })
    .lean();
  if (!latestRate) return product.total_price; // fallback to stored price
  const rate = parseFloat(latestRate.rate_per_gram);
  const subtotal = product.weight_grams * rate + product.making_charge;
  const total = subtotal + (subtotal * product.gst_percent) / 100;
  return total; // still precise
}

// Helper to round a number to nearest integer
const roundToInteger = (num) => Math.round(num);

exports.createProduct = async (data) => {
  const product = await Product.create(data);
  return product;
};

exports.getAllProducts = async (filter = {}) => {
  const products = await Product.find(filter)
    .populate("category_id", "name")
    .populate("metal_id", "metal_name purity")
    .lean();

  // Add computed display price and round it
  for (let p of products) {
    const precise = await getDynamicPrice(p);
    p.display_price = roundToInteger(precise);
  }
  return products;
};

exports.getProductById = async (id) => {
  const product = await Product.findById(id)
    .populate("category_id")
    .populate("metal_id")
    .lean();

  if (product) {
    const precise = await getDynamicPrice(product);
    product.display_price = roundToInteger(precise);

    // Add latest metal rate for transparency (keep decimal)
    if (product.metal_id) {
      const latestRate = await MetalRate.findOne({
        metal_id: product.metal_id._id,
      })
        .sort({ effective_date: -1 })
        .lean();
      product.current_rate = latestRate
        ? parseFloat(latestRate.rate_per_gram)
        : null;
    } else {
      product.current_rate = null;
    }
  }
  return product;
};

// ✅ This is the missing method – make sure it's present
exports.updateProduct = async (id, data) => {
  return await Product.findByIdAndUpdate(id, data, { new: true }).lean();
};

exports.toggleProductStatus = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new Error("Product not found");
  product.is_active = !product.is_active;
  await product.save();
  return product;
};

exports.deleteProduct = async (id) => {
  await Product.findByIdAndDelete(id);
  return { message: "Product deleted" };
};
