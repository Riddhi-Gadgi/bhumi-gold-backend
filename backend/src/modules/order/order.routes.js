const express = require("express");
const router = express.Router();
const controller = require("./order.controller");
const ensureAuth = require("../../middlewares/ensureAuth");
const ensureAdmin = require("../../middlewares/ensureAdmin");

router.use(ensureAuth);

// Static routes first
router.post("/", controller.createOrder);
router.get("/my-orders", controller.getMyOrders);
router.get("/admin", ensureAdmin, controller.getAllOrders);
router.patch("/:id/status", ensureAdmin, controller.updateOrderStatus);
// Parameterized route last
router.get("/:id", controller.getOrder);

// Update order status (admin)
router.patch("/:id/status", ensureAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { order_status: status },
      { new: true },
    );
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
