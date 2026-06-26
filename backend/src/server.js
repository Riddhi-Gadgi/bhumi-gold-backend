require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;

// Load environment variables
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(" 🚀 MongoDB connected to database:", mongoose.connection.name);
  })
  .catch((err) => {
    console.error("Mongo error:", err.message);
    process.exit(1);
  });

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
app.use((err, req, res, next) => {
  console.error(" Unhandled error:", err.stack);
  res.status(500).json({ message: err.message });
});

// Authentication middleware
const ensureAuth = require("./middlewares/ensureAuth");
const ensureAdmin = require("./middlewares/ensureAdmin");

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ==================== Import Route Modules ====================

// Auth
const authRoutes = require("./routes/auth");

// Metals (master)
const metalRoutes = require("./modules/metal/metal.routes");

// Metal Rates – split into public and admin
const metalRatePublicRoutes = require("./modules/metalRate/metalRate.public.routes");
const metalRateAdminRoutes = require("./modules/metalRate/metalRate.admin.routes");

const metalStockRoutes = require("./modules/metalStock/metalStock.routes");
const metalStockTransactionRoutes = require("./modules/metalStockTransaction/metalStockTransaction.routes");

// Categories & Products
const categoryRoutes = require("./modules/category/category.routes");
const productRoutes = require("./modules/product/product.routes");
const productStockRoutes = require("./modules/productStock/productStock.routes");
const productStockTransactionRoutes = require("./modules/productStockTransaction/productStockTransaction.routes");

// Inquiries & Quotations
const inquiryRoutes = require("./modules/inquiry/inquiry.routes");
const quotationRoutes = require("./modules/quotation/quotation.routes");
const customizationRoutes = require("./modules/customization/customization.routes");

// Cart & Orders
const cartRoutes = require("./modules/cart/cart.routes");
const orderRoutes = require("./modules/order/order.routes");

// Payments
const paymentRoutes = require("./modules/payment/payment.routes");

// Pickup
const pickupSlotRoutes = require("./modules/pickupSlot/pickupSlot.routes");
const pickupRoutes = require("./modules/pickup/pickup.routes");

// Reviews, Feedback, Complaints
const reviewRoutes = require("./modules/review/review.routes");
const feedbackRoutes = require("./modules/feedback/feedback.routes");
const complaintRoutes = require("./modules/complaint/complaint.routes");

// Invoices
const invoiceRoutes = require("./modules/invoice/invoice.routes");

// Customers (admin)
const customerAdminRoutes = require("./modules/customer/customer.routes");

// ==================== Public Routes (no authentication) ====================
app.use("/api/auth", authRoutes);

app.use("/api/public/products", productRoutes.public);
app.use("/api/public/categories", categoryRoutes.public);
app.use("/api/public/metals", metalRoutes.public);
app.use("/api/public/metal-rates", metalRatePublicRoutes); // ✅ public metal rates

// ==================== Customer Routes (authenticated) ====================
app.use("/api/cart", ensureAuth, cartRoutes);
app.use("/api/orders", ensureAuth, orderRoutes);
app.use("/api/payments", ensureAuth, paymentRoutes);
app.use("/api/inquiries", ensureAuth, inquiryRoutes);
app.use("/api/quotations", ensureAuth, quotationRoutes);
app.use("/api/pickups", ensureAuth, pickupRoutes);
app.use("/api/reviews", ensureAuth, reviewRoutes);
app.use("/api/feedback", ensureAuth, feedbackRoutes);
app.use("/api/complaints", ensureAuth, complaintRoutes);
app.use(
  "/api/customers",
  ensureAuth,
  require("./modules/customer/customer.routes"),
);

// ==================== Admin Routes (authenticated + admin role) ====================

// Metals
app.use("/api/admin/metals", ensureAuth, ensureAdmin, metalRoutes.admin);
app.use(
  "/api/admin/metal-rates",
  ensureAuth,
  ensureAdmin,
  metalRateAdminRoutes,
); // ✅ admin metal rates
app.use("/api/admin/metal-stock", ensureAuth, ensureAdmin, metalStockRoutes);
app.use(
  "/api/admin/metal-stock-transactions",
  ensureAuth,
  ensureAdmin,
  metalStockTransactionRoutes,
);

// Categories & Products
app.use("/api/admin/categories", ensureAuth, ensureAdmin, categoryRoutes.admin);
app.use("/api/admin/products", ensureAuth, ensureAdmin, productRoutes.admin);
app.use(
  "/api/admin/product-stock",
  ensureAuth,
  ensureAdmin,
  productStockRoutes,
);
app.use(
  "/api/admin/product-stock-transactions",
  ensureAuth,
  ensureAdmin,
  productStockTransactionRoutes,
);

// Inquiries, Quotations, Customizations
app.use("/api/admin/inquiries", ensureAuth, ensureAdmin, inquiryRoutes);
app.use("/api/admin/quotations", ensureAuth, ensureAdmin, quotationRoutes);
app.use(
  "/api/admin/customizations",
  ensureAuth,
  ensureAdmin,
  customizationRoutes,
);

// Orders & Payments
app.use("/api/admin/orders", ensureAuth, ensureAdmin, orderRoutes);
app.use("/api/admin/payments", ensureAuth, ensureAdmin, paymentRoutes);

// Pickup Slots & Pickups
app.use("/api/admin/pickup-slots", ensureAuth, ensureAdmin, pickupSlotRoutes);
app.use("/api/admin/pickups", ensureAuth, ensureAdmin, pickupRoutes);

// Reviews, Feedback, Complaints
app.use("/api/admin/reviews", ensureAuth, ensureAdmin, reviewRoutes);
app.use("/api/admin/feedback", ensureAuth, ensureAdmin, feedbackRoutes);
app.use("/api/admin/complaints", ensureAuth, ensureAdmin, complaintRoutes);

// ==================== Admin Reports ====================
// const reportRoutes = require("./modules/report/report.routes");
// app.use("/api/admin/reports", ensureAuth, ensureAdmin, reportRoutes);

// Invoices
app.use("/api/invoices", ensureAuth, invoiceRoutes);

// Customers (admin)
app.use("/api/admin/customers", ensureAuth, ensureAdmin, customerAdminRoutes);

// ==================== Dashboard Example ====================
app.get("/app", ensureAuth, (req, res) => {
  if (req.user.role === "admin") {
    return res.send("Hello Admin");
  }
  return res.send("Hello Customer");
});

// ==================== Root ====================
app.get("/", (req, res) => res.send("🚀 API is running"));

// ==================== Start Server ====================
app.listen(PORT, () => console.log(` 🚀 Server running on port ${PORT}`));
