const service = require("./complaint.service");

exports.createComplaint = async (req, res) => {
  try {
    const data = { ...req.body, customer_id: req.user.customer_id };
    const complaint = await service.createComplaint(data);
    res.status(201).json(complaint);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await service.getMyComplaints(req.user.customer_id);
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getComplaint = async (req, res) => {
  try {
    const complaint = await service.getComplaintById(req.params.id);
    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });
    // Ensure customer can only view own complaints (unless admin)
    if (
      req.user.role !== "admin" &&
      complaint.customer_id._id.toString() !== req.user.customer_id
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await service.getAllComplaints();
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateComplaint = async (req, res) => {
  try {
    const updated = await service.updateComplaint(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await service.updateStatus(req.params.id, status);
    res.json(complaint);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteComplaint = async (req, res) => {
  try {
    const result = await service.deleteComplaint(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
