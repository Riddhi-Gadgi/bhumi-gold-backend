const Metal = require("../metal/metal.model");

exports.createMetal = async (data) => {
  return await Metal.create(data);
};

exports.getAllMetals = async (filter = {}) => {
  return await Metal.find(filter).sort({ created_at: -1 });
};

exports.getMetalById = async (id) => {
  return await Metal.findById(id);
};

exports.updateMetal = async (id, data) => {
  return await Metal.findByIdAndUpdate(id, data, { new: true });
};

exports.toggleMetalStatus = async (id) => {
  const metal = await Metal.findById(id);
  if (!metal) throw new Error("Metal not found");

  metal.is_active = !metal.is_active;
  await metal.save();
  return metal;
};
