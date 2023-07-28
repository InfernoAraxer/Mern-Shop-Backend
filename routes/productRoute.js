const express = require('express');
const { createProduct, getaProduct, getAllProducts, updateProduct, deleteProduct, addToWishlist, rating } = require("../controller/productCtrl");
const { isAdmin, authMiddleware} = require("../middlewares/authMiddleware");
const { uploadPhoto, productImgResize } = require('../middlewares/uploadImages');
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createProduct);
router.get("/:id", getaProduct);
router.put("/wishlist", authMiddleware, addToWishlist);
router.put("/rating", authMiddleware, rating);
router.put("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);

router.get("/", getAllProducts);

module.exports = router;
