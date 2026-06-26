// product.controller.js
const service = require("./product.service");
const path = require("path");
const fs = require("fs");
const Inquiry = require("../inquiry/inquiry.model");
const Attachment = require("../inquiryAttachment/inquiryAttachment.model");

// Import stock service and transaction model (if needed for manual logs)
const stockService = require("../productStock/productStock.service");
const Transaction = require("../productStockTransaction/productStockTransaction.model");

exports.createProduct = async (req, res) => {
  try {
    const productData = JSON.parse(req.body.data);
    let images = [];

    // Add images uploaded directly with this request
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `/uploads/products/${file.filename}`);
    }

    // If this product is linked to an inquiry, copy its attachment images
    if (productData.inquiry_id) {
      const attachments = await Attachment.find({
        inquiry_id: productData.inquiry_id,
      }).lean();
      attachments.forEach((att) => {
        let filePath = att.image_path;
        if (filePath.includes(":\\")) {
          const filename = filePath.split("\\").pop();
          filePath = `/uploads/products/${filename}`;
        } else if (!filePath.startsWith("/uploads/")) {
          const clean = filePath.replace(/^uploads[\\/]?/, "");
          filePath = `/uploads/products/${clean}`;
        }
        if (!images.includes(filePath)) {
          images.push(filePath);
        }
      });
    }

    // Create the product with all provided data
    const product = await service.createProduct({
      ...productData,
      images,
    });

    // 👇 For readymade products, create/update stock record and log transaction
    if (!product.is_custom) {
      // Use stockService.updateStock which logs an 'adjustment' transaction
      // We pass initial quantity as available_quantity
      await stockService.updateStock(
        product._id,
        { available_quantity: productData.stock_qty || 0, reserved_quantity: 0 },
        {
          notes: "Initial stock from product creation",
          reference_id: product._id, // optional: link to product itself
          reference_model: "Product",
        }
      );
    }

    res.status(201).json(product);
  } catch (err) {
    console.error("Create product error:", err);
    res.status(400).json({ message: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await service.getAllProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper function to ensure a stock record exists and return current stock
const ensureStockAndGet = async (product) => {
  if (product.is_custom) return Infinity;

  // Try to find existing stock via service
  let stock = await stockService.getStockByProduct(product._id);
  if (!stock) {
    // No stock record – fallback to product.stock_qty and create one with a transaction
    const initialQty = product.stock_qty || 0;
    stock = await stockService.updateStock(
      product._id,
      { available_quantity: initialQty, reserved_quantity: 0 },
      {
        notes: "Auto-created from product fetch fallback",
        reference_id: product._id,
        reference_model: "Product",
      }
    );
  }
  return stock.available_quantity - stock.reserved_quantity;
};

exports.getActiveProducts = async (req, res) => {
  try {
    let products = await service.getAllProducts({ is_active: true });

    // Attach current stock for readymade products
    products = await Promise.all(
      products.map(async (p) => {
        p = p.toObject ? p.toObject() : p;
        p.current_stock = await ensureStockAndGet(p);
        return p;
      })
    );

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    let product = await service.getProductById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product = product.toObject ? product.toObject() : product;
    product.current_stock = await ensureStockAndGet(product);

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productData = JSON.parse(req.body.data);
    let images = productData.images || [];

    // Add newly uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(
        (file) => `/uploads/products/${file.filename}`
      );
      images = [...images, ...newImages];
    }

    // Remove images that were marked for deletion
    if (req.body.removedImages) {
      const removed = JSON.parse(req.body.removedImages);
      removed.forEach((imgPath) => {
        const fullPath = path.join(__dirname, "../../../", imgPath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      });
    }

    const updated = await service.updateProduct(id, { ...productData, images });

    // If stock_qty is provided and product is not custom, update stock via service
    if (!updated.is_custom && productData.stock_qty !== undefined) {
      // Use updateStock which will log an adjustment transaction
      await stockService.updateStock(
        id,
        { available_quantity: productData.stock_qty },
        {
          notes: "Stock updated via product edit",
          reference_id: id,
          reference_model: "Product",
        }
      );
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.toggleProductStatus = async (req, res) => {
  try {
    const product = await service.toggleProductStatus(req.params.id);
    res.json(product);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const result = await service.deleteProduct(req.params.id);
    // Optionally also delete associated stock record
    await stockService.deleteStockByProductId(req.params.id); // you may need to add this method
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};