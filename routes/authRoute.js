const express = require('express');
const { createUser, loginUserCtrl, getallUsers, getaUser, deleteUser, updatedUser, blockUser, unblockUser, handleRefreshToken, logout } = require('../controller/userCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

//API Routes for Backend Usage
router.post('/register', createUser);
router.post('/login', loginUserCtrl);

router.get('/all-users', getallUsers);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout)
router.get('/:id', authMiddleware, isAdmin, getaUser);
router.delete("/:id", deleteUser);
router.put("/edit-user", authMiddleware, updatedUser);
router.put("/block-user/:id", authMiddleware, blockUser);
router.put("/unblock-user/:id", authMiddleware, unblockUser);

module.exports = router;