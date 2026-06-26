const service = require("./customer.service");

exports.getAllCustomers = async (req, res) => {
  try {
    const { page, limit, search, pincode } = req.query;
    const result = await service.getAllCustomers({
      page,
      limit,
      search,
      pincode,
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await service.getCustomerById(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.json({ customer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const customer = await service.createCustomer(req.body);
    res.status(201).json({ customer });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const customer = await service.updateCustomer(req.params.id, req.body);
    res.json({ customer });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const result = await service.deleteCustomer(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.toggleCustomerStatus = async (req, res) => {
  try {
    const customer = await service.toggleCustomerStatus(req.params.id);
    res.json(customer);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.getMyInquiries = async (req, res) => {
  try {
    console.log("🔍 [getMyInquiries] Received request");
    console.log("👉 Customer ID from token:", req.user.customer_id);

    const inquiries = await service.getMyInquiries(req.user.customer_id);

    console.log(`✅ Found ${inquiries.length} inquiries for this customer`);
    res.json(inquiries);
  } catch (err) {
    console.error("❌ Error in getMyInquiries:", err);
    res.status(500).json({ message: err.message });
  }
};
