const service = require("./inquiry.service");

exports.createInquiry = async (req, res) => {
  try {
    // 1. Prepare inquiry data (without images)
    const inquiryData = {
      ...req.body,
      customer_id: req.user.customer_id,
    };

    // 2. Create the inquiry
    const inquiry = await service.createInquiry(inquiryData);

    // 3. If files were uploaded, create attachments with relative paths
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Construct relative path: uploads/products/filename
        const relativePath = `uploads/products/${file.filename}`;
        await service.addAttachment(inquiry._id, relativePath);
      }
    }

    // 4. Fetch the complete inquiry with attachments
    const fullInquiry = await service.getInquiryById(inquiry._id);
    res.status(201).json(fullInquiry);
  } catch (err) {
    console.error("Create inquiry error:", err);
    res.status(400).json({ message: err.message });
  }
};

exports.getAllInquiries = async (req, res) => {
  try {
    const inquiries = await service.getAllInquiries();
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getInquiryById = async (req, res) => {
  try {
    const inquiry = await service.getInquiryById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });
    res.json(inquiry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateInquiry = async (req, res) => {
  try {
    const updated = await service.updateInquiry(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const inquiry = await service.updateStatus(req.params.id, status);
    res.json(inquiry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.uploadAttachment = async (req, res) => {
  try {
    const { inquiry_id } = req.params;
    const image_path = req.file.path;
    const attachment = await service.addAttachment(inquiry_id, image_path);
    res.status(201).json(attachment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
