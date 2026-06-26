const Customer = require("../customer/customer.model");
const User = require("../user/user.model");
const service = require("./customer.service");
const Inquiry = require("../inquiry/inquiry.model");

// In customer.service.js
exports.getAllCustomers = async ({
  page = 1,
  limit = 10,
  search = "",
  pincode = "",
}) => {
  const query = {};

  // Search by user fields
  if (search) {
    query.$or = [
      { "user_id.full_name": { $regex: search, $options: "i" } },
      { "user_id.email": { $regex: search, $options: "i" } },
      { "user_id.phone": { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const limitNum = Number(limit);

  const customers = await Customer.find(query)
    .populate("user_id", "full_name email phone is_active") // ✅ use full_name
    .skip(skip)
    .limit(limitNum)
    .lean();

  const total = await Customer.countDocuments(query);

  return {
    items: customers,
    total,
    page: Number(page),
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

// Get a single customer by ID
exports.getCustomerById = async (id) => {
  return await Customer.findById(id).populate("user_id").lean();
};

// Create a new customer (admin creates user + customer)
exports.createCustomer = async (data) => {
  // data should include user fields (name, email, phone, password) and customer fields (gender, dob)
  const { name, email, phone, password, gender, date_of_birth } = data;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Email already registered");

  // Hash password
  const bcrypt = require("bcryptjs");
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user – use full_name, not name
  const user = await User.create({
    full_name: name, // ✅ correct
    email,
    phone,
    password_hash: hashedPassword,
    role: "customer",
    is_active: true,
  });
  // Create customer profile
  const customer = await Customer.create({
    user_id: user._id,
    gender,
    date_of_birth,
  });

  return customer.populate("user_id");
};

// Update customer
exports.updateCustomer = async (id, data) => {
  const { name, email, phone, gender, date_of_birth, is_active } = data;
  const customer = await Customer.findById(id).populate("user_id");
  if (!customer) throw new Error("Customer not found");

  // Update user fields if provided
  // Update user fields if provided
  if (name) customer.user_id.full_name = name;
  if (email) customer.user_id.email = email;
  if (phone) customer.user_id.phone = phone;
  if (is_active !== undefined) customer.user_id.is_active = is_active;
  await customer.user_id.save();

  // Update customer fields
  if (gender) customer.gender = gender;
  if (date_of_birth) customer.date_of_birth = date_of_birth;
  await customer.save();

  return customer.populate("user_id");
};

// Delete customer (deactivate user)
exports.deleteCustomer = async (id) => {
  const customer = await Customer.findById(id).populate("user_id");
  if (!customer) throw new Error("Customer not found");
  // Instead of hard delete, deactivate user
  customer.user_id.is_active = false;
  await customer.user_id.save();
  return { message: "Customer deactivated" };
};

// Toggle customer active status
exports.toggleCustomerStatus = async (id) => {
  const customer = await Customer.findById(id).populate("user_id");
  if (!customer) throw new Error("Customer not found");
  customer.user_id.is_active = !customer.user_id.is_active;
  await customer.user_id.save();
  return customer;
};

exports.getMyInquiries = async (customerId) => {
  return await Inquiry.find({ customer_id: customerId })
    .populate({
      path: "customer_id",
      populate: { path: "user_id", select: "name email phone" },
    })
    .sort({ created_at: -1 })
    .lean();
};
