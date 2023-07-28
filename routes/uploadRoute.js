const express = require('express');
const { uploadImages, deleteImages } = require("../controller/uploadCtrl");
const { isAdmin, authMiddleware} = require("../middlewares/authMiddleware");
const { uploadPhoto, productImgResize } = require('../middlewares/uploadImages');
const router = express.Router();

router.put("/", authMiddleware, isAdmin, uploadPhoto.array('images', 10), productImgResize, uploadImages)
router.delete("/delete-img/:id", authMiddleware, isAdmin, deleteImages);


module.exports = router;
