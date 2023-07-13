const express = require('express');
const { createProduct, getaProduct, getAllProducts, updateProduct, deleteProduct } = require("../controller/productCtrl");
const router = express.Router();

router.post("/", createProduct);

router.get("/:id", getaProduct);

router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

router.get("/", getAllProducts);

module.exports = router;
