const express = require('express');
const { createUser, loginUserCtrl, getallUsers, getaUser, deleteUser, updatedUser, blockUser, unblockUser, handleRefreshToken, logout, updatePassword, forgotPasswordToken, resetPassword, loginAdmin, getWishlist, saveAddress, userCart, getUserCart, createOrder, removeProductFromCart, updateProductQuantityFromCart, getMyOrders, getMonthWiseOrderIncome, getYearlyTotalOrders, getAllOrders, getSingleOrder, updateOrder, emptyCart } = require('../controller/userCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { checkout, paymentVerification } = require('../controller/paymentCtrl');
const router = express.Router();

//API Routes for Backend Usage
router.post('/register', createUser);
router.post('/forgot-password-token', forgotPasswordToken);

router.put('/reset-password/:token', resetPassword);
router.put('/password', authMiddleware, updatePassword);
// router.put('/order/update-order/:id', authMiddleware, isAdmin, updateOrderStatus);

router.post('/login', loginUserCtrl);   
router.post('/admin-login', loginAdmin);
router.post('/cart', authMiddleware, userCart);
router.post('/order/checkout', authMiddleware, checkout);
router.post('/order/paymentVerification', authMiddleware, paymentVerification);
// router.post('/cart/applycoupon', authMiddleware, applyCoupon);
router.post('/cart/create-order', authMiddleware, createOrder);

router.get('/wishlist', authMiddleware, getWishlist);
router.get('/all-users', getallUsers);
router.get('/getmyorders', authMiddleware, getMyOrders); 
router.get('/getMonthWiseOrderIncome', authMiddleware, getMonthWiseOrderIncome);
router.get('/getYearlyTotalOrders', authMiddleware, getYearlyTotalOrders);
router.get('/getallorders', authMiddleware, isAdmin, getAllOrders); // Gets all orders
router.get('/getaorder/:id', authMiddleware, isAdmin, getSingleOrder);
router.put('/updateOrder/:id', authMiddleware, isAdmin, updateOrder);

// router.post('/getorderbyuser/:id', authMiddleware, isAdmin, getOrderByUserId); 

router.get("/refresh", handleRefreshToken); 
router.get("/logout", logout)
router.get('/cart', authMiddleware, getUserCart);
router.get('/:id', authMiddleware, isAdmin, getaUser);

router.delete("/update-product-cart/:cartItemId/:newQuantity", authMiddleware, updateProductQuantityFromCart);
router.delete("/delete-product-cart/:cartItemId", authMiddleware, removeProductFromCart);
router.delete("/empty-cart", authMiddleware, emptyCart);
router.delete("/:id", deleteUser);

router.put("/edit-user", authMiddleware, updatedUser);
router.put("/save-address", authMiddleware, saveAddress);
router.put("/block-user/:id", authMiddleware, blockUser);
router.put("/unblock-user/:id", authMiddleware, unblockUser);

module.exports = router;