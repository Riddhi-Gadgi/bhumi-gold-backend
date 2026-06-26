const Quotation = require("./quotation.model");
const QuotationItem = require("../quotationItem/quotationItem.model");
const Product = require("../product/product.model");
const Customization = require("../customization/customization.model");
const cartService = require("../cart/cart.service");
const Inquiry = require("../inquiry/inquiry.model");
const mongoose = require("mongoose");
const Category = require("../category/category.model");
const MetalRate = require("../metalRate/metalRate.model");

exports.createQuotation = async (data, items) => {
  const quotation = await Quotation.create(data);
  if (items && items.length) {
    const itemDocs = items.map((item) => ({
      ...item,
      quotation_id: quotation._id,
    }));
    await QuotationItem.create(itemDocs);
  }
  await Inquiry.findByIdAndUpdate(data.inquiry_id, { status: "quoted" });
  return quotation;
};

exports.getQuotationById = async (id) => {
  const quotation = await Quotation.findById(id).populate("inquiry_id").lean();
  if (quotation) {
    const items = await QuotationItem.find({ quotation_id: id })
      .populate("metal_id", "metal_name purity")
      .lean();
    quotation.items = items;
  }
  return quotation;
};

exports.getQuotationByInquiry = async (inquiry_id) => {
  const quotation = await Quotation.findOne({ inquiry_id }).lean();
  if (quotation) {
    const items = await QuotationItem.find({ quotation_id: quotation._id })
      .populate("metal_id", "metal_name purity")
      .lean();
    quotation.items = items;
  }
  return quotation;
};

exports.updateQuotationStatus = async (id, status) => {
  const quotation = await Quotation.findById(id);
  if (!quotation) throw new Error("Quotation not found");
  quotation.status = status;
  await quotation.save();
  return quotation;
};

exports.acceptQuotation = async (quotationId, customerId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Fetch quotation
    const quotation = await Quotation.findById(quotationId).session(session);
    if (!quotation) throw new Error("Quotation not found");
    if (quotation.status !== "sent")
      throw new Error("Quotation is not in sent state");
    if (new Date() > new Date(quotation.valid_until))
      throw new Error("Quotation has expired");

    // 2. Fetch items
    const items = await QuotationItem.find({
      quotation_id: quotationId,
    }).session(session);
    if (!items.length) throw new Error("Quotation has no items");

    // Assume one item per quotation (for simplicity)
    const item = items[0];

    // 3. Find or create "Custom" category
    let customCategory = await Category.findOne({ name: "Custom" }).session(
      session,
    );
    if (!customCategory) {
      const created = await Category.create(
        [
          {
            name: "Custom",
            description: "Custom-made products from quotations",
            is_active: true,
          },
        ],
        { session },
      );
      customCategory = created[0];
    }

    // 4. Get latest metal rate
    const latestRate = await MetalRate.findOne({ metal_id: item.metal_id })
      .sort({ effective_date: -1 })
      .session(session);
    if (!latestRate) {
      throw new Error(`No metal rate found for metal ID ${item.metal_id}`);
    }

    // 5. Create product (ensure all required fields, including images)
    const productData = {
      customization_id: null,
      category_id: customCategory._id,
      metal_id: item.metal_id,
      metal_rate_id: latestRate._id,
      name: `Custom item for quotation ${quotationId}`,
      weight_grams: item.estimated_weight,
      making_charge: item.making_charge,
      gst_percent: 0, // adjust as needed
      total_price: item.total_price,
      stock_qty: 1,
      images: [], // 👈 required to avoid validation errors if field is required (though schema says not required, but add for safety)
      is_custom: true,
      is_active: true,
    };

    console.log("📦 Creating product with data:", productData);
    const product = await Product.create([productData], { session });
    const productId = product[0]._id;
    console.log("✅ Product created with ID:", productId);

    // 🔍 Verify product is findable within the same session
    const verifyProduct = await Product.findById(productId).session(session);
    if (!verifyProduct) {
      throw new Error("❌ Product not found immediately after creation!");
    } else {
      console.log("✅ Product verified in transaction");
    }

    // 6. Create customization record
    const customizationData = {
      quotation_id: quotationId,
      product_id: productId,
      required_weight: item.estimated_weight,
      status: "pending",
    };
    await Customization.create([customizationData], { session });

    // 7. Add product to cart (pass session)
    console.log("🔄 Calling cartService.addItem with session:", !!session);
    await cartService.addItem(customerId, productId, 1, session);
    console.log("🛒 Item added to cart");

    // 8. Update quotation status
    quotation.status = "accepted";
    await quotation.save({ session });

    await session.commitTransaction();
    console.log("🎉 Transaction committed");
    return { product: product[0], quotation };
  } catch (error) {
    console.error("❌ Error in acceptQuotation:", error);
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
