const express = require("express");
const router = express.Router();
const controller = require("./metal.controller");

// Admin
router.post("/", controller.createMetal);
router.get("/", controller.getAllMetals);
router.put("/:id", controller.updateMetal);
router.patch("/:id/toggle", controller.toggleMetalStatus);

// Public
const publicRouter = express.Router();
publicRouter.get("/", controller.getActiveMetals);

module.exports = {
  admin: router,
  public: publicRouter,
};
