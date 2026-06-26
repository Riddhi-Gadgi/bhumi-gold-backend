const express = require("express");
const router = express.Router();
const controller = require("./categoryMetal.controller");

router.post("/", controller.addMetal);
router.delete("/:category_id/:metal_id", controller.removeMetal);
router.get("/:category_id", controller.getMetals);

module.exports = router;
