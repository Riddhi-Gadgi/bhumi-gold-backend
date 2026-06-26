const Customization = require("./customization.model");

exports.getAllCustomizations = async () => {
  return await Customization.find()
    .populate("quotation_id")
    .populate("product_id")
    .lean();
};

exports.getCustomizationById = async (id) => {
  return await Customization.findById(id)
    .populate("quotation_id")
    .populate("product_id")
    .lean();
};

exports.getCustomizationByQuotation = async (quotationId) => {
  return await Customization.findOne({ quotation_id: quotationId })
    .populate("product_id")
    .lean();
};

exports.createCustomization = async (data) => {
  return await Customization.create(data);
};

exports.updateStatus = async (id, status) => {
  const customization = await Customization.findById(id);
  if (!customization) throw new Error("Customization not found");
  customization.status = status;
  if (status === "in_progress") customization.start_date = new Date();
  if (status === "completed") customization.completion_date = new Date();
  await customization.save();
  return customization;
};

exports.updateCustomization = async (id, data) => {
  return await Customization.findByIdAndUpdate(id, data, { new: true }).lean();
};

exports.deleteCustomization = async (id) => {
  await Customization.findByIdAndDelete(id);
  return { message: "Customization deleted" };
};
