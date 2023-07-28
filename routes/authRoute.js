const express = require('express');
const { createUser, loginUserCtrl, getallUsers, getaUser, deleteUser, updatedUser, blockUser, unblockUser, handleRefreshToken, logout, updatePassword, forgotPasswordToken, resetPassword, loginAdmin, getWishlist, saveAddress, userCart, getUserCart, emptyCart, applyCoupon, createOrder, getAllOrders, updateOrderStatus, getOrders, getOrderByUserId } = require('../controller/userCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

//API Routes for Backend Usage
router.post('/register', createUser);
router.post('/forgot-password-token', forgotPasswordToken);
router.put('/reset-password/:token', resetPassword);
router.put('/password', authMiddleware, updatePassword);
router.put('/order/update-order/:id', authMiddleware, isAdmin, updateOrderStatus);
router.post('/login', loginUserCtrl);   
router.post('/admin-login', loginAdmin);
router.post('/cart', authMiddleware, userCart);
router.post('/cart/applycoupon', authMiddleware, applyCoupon);
router.post('/cart/cash-order', authMiddleware, createOrder);
router.get('/wishlist', authMiddleware, getWishlist);
router.get('/all-users', getallUsers);
router.get('/get-orders', authMiddleware, getOrders); // Gets first order from individual
router.get('/getallorders', authMiddleware, isAdmin, getAllOrders); // Gets all orders
router.post('/getorderbyuser/:id', authMiddleware, isAdmin, getOrderByUserId); 
router.get("/refresh", handleRefreshToken); 
router.get("/logout", logout)
router.get('/cart', authMiddleware, getUserCart);
router.get('/:id', authMiddleware, isAdmin, getaUser);
router.delete("/empty-cart", authMiddleware, emptyCart);
router.delete("/:id", deleteUser);
router.put("/edit-user", authMiddleware, updatedUser);
router.put("/save-address", authMiddleware, saveAddress);
router.put("/block-user/:id", authMiddleware, blockUser);
router.put("/unblock-user/:id", authMiddleware, unblockUser);

module.exports = router;