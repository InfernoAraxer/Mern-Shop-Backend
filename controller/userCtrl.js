const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Coupon = require('../models/couponModel');
const Order = require('../models/orderModel');

const uniqid = require('uniqid');
const { generateToken } = require('../config/jwtToken');
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require('../utils/validateMongodbId');
const { generateRefreshToken } = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
const sendEmail = require("./emailCtrl");
const crypto = require("crypto");

const createUser = asyncHandler(async (req, res) => { 
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
        // Create a new User
        const newUser = await User.create(req.body);
        res.json(newUser);
    } else {
        // User Already Exists
        throw new Error('User Already Exists');
    }
});

const loginUserCtrl = asyncHandler (async (req, res) => {
    const {email, password} = req.body;
    
    // Check if user exists or not
    const findUser = await User.findOne({email});
    if (findUser && await findUser.isPasswordMatched(password)) {       // Is able to use functions created in UserModel
        const refreshToken = await generateRefreshToken(findUser?.id);
        const updateUser = await User.findByIdAndUpdate(findUser.id, 
            { 
                refreshToken: refreshToken
            }, 
            { 
                new: true 
            });
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                maxAge: 72 * 60 * 60 * 1000,
            });
        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id),
        });
    } else {
        throw new Error("Invalid Credentials");
    }; 
});

// Admin Login

const loginAdmin = asyncHandler (async (req, res) => {
    const {email, password} = req.body;
    
    // Check if admin  exists or not
    const findAdmin = await User.findOne({email});
    if (findAdmin.role !== 'admin') throw new Error("Not Authorized");
    if (findAdmin && await findAdmin.isPasswordMatched(password)) {       // Is able to use functions created in UserModel
        const refreshToken = await generateRefreshToken(findAdmin?.id);
        const updateAdmin = await User.findByIdAndUpdate(findAdmin.id, 
            { 
                refreshToken: refreshToken
            }, 
            { 
                new: true 
            });
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                maxAge: 72 * 60 * 60 * 1000,
            });
        res.json({
            _id: findAdmin?._id,
            firstname: findAdmin?.firstname,
            lastname: findAdmin?.lastname,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            token: generateToken(findAdmin?._id),
        });
    } else {
        throw new Error("Invalid Credentials");
    }; 
});

// Handle Refresh Token

const handleRefreshToken = asyncHandler( async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error('No Refresh Token in Cookies');
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) throw new Error("No Refresh Token present in Database or not matched");
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        console.log(decoded);
        if (err || user.id !== decoded.id) {
            throw new Error('There is something wrong with refresh token');
        }
        const accessToken = generateToken(user?._id);
        res.json({accessToken});
    })
    res.json(user);
});

// Logout Functionality 

const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error('No Refresh Token in Cookies');
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
        });
        return res.sendStatus(204); // forbidden
    }
    await User.findOneAndUpdate({ refreshToken }, {
        refreshToken: "",
    });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
    });
    return res.sendStatus(204); // forbidden
})

// Update a User

const updatedUser = asyncHandler(async (req, res) => {
    const { _id } = req.user; 
    validateMongoDbId(_id);
    try {
        const updatedUser = await User.findByIdAndUpdate(_id, { // Needs Verification later (will not be from Params)
            firstname: req?.body?.firstname,
            lastname: req?.body?.lastname,
            email: req?.body?.email,
            mobile: req?.body?.mobile
        },
        {
            new: true,
        });
        res.json(updatedUser);
    } catch (error) {
        throw new Error(error);
    }
})

// Saves User's Address

const saveAddress = asyncHandler(async (req, res, next) => {
    const { _id } = req.user; 
    validateMongoDbId(_id);
    try {
        const updatedUser = await User.findByIdAndUpdate(_id, { // Needs Verification later (will not be from Params)
            address: req?.body?.address,
        },
        {
            new: true,
        });
        res.json(updatedUser);
    } catch (error) {
        throw new Error(error);
    }
})

// Get All Users

const getallUsers = asyncHandler (async (req, res) => {
    try {
        const getUsers = await User.find()
        res.json(getUsers);
    } catch (error) {
        throw new Error(error);
    }
})

// Get a Single User

const getaUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const getaUser = await User.findById(id);
        res.json(getaUser);
    } catch (error) {
        throw new Error(error);
    }
})

// Delete a User

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deleteUser = await User.findByIdAndDelete(id);
        res.json(deleteUser);
    } catch (error) {
        throw new Error(error);
    }
})

// Blocks a User

const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const blockedUser = await User.findByIdAndUpdate(id, {
            isBlocked: true,
        },
        {
            new: true
        }
    );
    res.json({
        message: "User Blocked",
    });
    } catch (error) {
        throw new Error(error);
    }
});

// Unblocks a User

const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const block = await User.findByIdAndUpdate(id, {
            isBlocked: false,
        },
        {
            new: true
        }
    );
    res.json({
        message: "User Unblocked"
    })
    } catch (error) {
        throw new Error(error);
    }
});

const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body;
    validateMongoDbId(_id);
    const user = await User.findById(_id);
    if (password) {
        user.password = password;
        const updatedPassword = await user.save();
        res.json(updatedPassword);
    } else {
        res.json(user);
    }
})

const forgotPasswordToken = asyncHandler (async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error("user not found with this email");

    try {
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid for 10 minute from now. <a href='http://localhost:8000/api/user/reset-password/${token}'>Click Here</a>`
        const data = {
            to: email,
            test:"Hey User",
            subject: "Forgot Password Link",
            htm: resetURL,
        }; 
        sendEmail(data);
        res.json(token);
    } catch (error) {
        throw new Error(error);
    }
})

const resetPassword = asyncHandler(async(req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now()},
    });
    if(!user) throw new Error(" Token Expired, Please try again later");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
});

const getWishlist = asyncHandler(async(req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        const findUser = await User.findById(_id).populate("wishlist");
        res.json(findUser);
    } catch (error) {
        throw new Error(error);
    }
});

// User Cart Functionality

const userCart = asyncHandler(async(req, res) => {
    const { cart } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        let products = [];
        const user = await User.findById(_id);
        // Check if User already have products in Cart
        const alreadyExistsCart = await Cart.findOne({ orderby: user._id})
        if (alreadyExistsCart) {
            alreadyExistsCart.remove();
        }
        for (let i = 0; i < cart.length; i++) {
            let object = {};
            object.product = cart[i]._id;
            object.count = cart[i].count;
            object.color = cart[i].color;
            let getPrice = await Product.findById(cart[i]._id).select("price").exec();
            object.price = getPrice.price;
            products.push(object);
        }
        let cartTotal = 0;
        for (let i  = 0; i < products.length; i++) {
            cartTotal = cartTotal + products[i].price * products[i].count;
        }
        let newCart = await new Cart({
            products,
            cartTotal,
            orderedby: user?._id, 
        }).save();
        res.json(newCart)
    } catch (error) {
        throw new Error(error);
    }
});

const getUserCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
    const cart = await Cart.findOne({ orderedby: _id }).populate("products.product");
        res.json(cart); 
    } catch (error) {
        throw new Error(error);
    }
});

const emptyCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        const user = await User.findOne({ _id });
        const cart = await Cart.findOneAndRemove({ orderby: user._id })
        res.json(cart); 
    } catch (error) {
        throw new Error(error);
    }
});

const applyCoupon = asyncHandler(async (req, res) => {
    const { coupon } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);

    const validCoupon = await Coupon.findOne({ name: coupon });
    if(validCoupon === null) {
        throw new Error(" Invalid Coupon");
    }
    const user = await User.findOne({ _id });
    let { products, cartTotal } = await Cart.findOne({ orderedby: user._id }).populate("products.product");
    let totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount/100).toFixed(2));
    await Cart.findOneAndUpdate({ orderedby: user._id}, {totalAfterDiscount}, {new: true});
    res.json(totalAfterDiscount);
});

const createOrder = asyncHandler(async (req, res) => {
    const { COD, couponApplied } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        if (!COD) throw new Error("Create cash order failed.");
        const user = await User.findById(_id);
        let userCart = await Cart.findOne({ orderby: user._id });
        let finalAmount = 0;
        if (couponApplied && userCart.totalAfterDiscount) {
            finalAmount = userCart.totalAfterDiscount;
        } else {
            finalAmount = userCart.cartTotal;
        }
        let newOrder = await new Order({
            products: userCart.products,
            paymentMethod: {
                id: uniqid(),
                method: "COD",
                amount: finalAmount,
                status: "Cash on Delivery",
                created: Date.now(),
                currency: "USD",
            },
            orderedby: user._id,
            orderStatus: "Cash on Delivery",
        }).save();
        let update = userCart.products.map((item) => {
            return {
                updateOne: {
                    filter: { _id: item.product._id},
                    update: { $inc: { quantity: -item.count, sold: +item.count } }
                },
            };
        });
        const updated = await Product.bulkWrite(update, {});
        res.json({ message: "success" });
    } catch (error) {
        throw new Error(error);
    }
});

// Gets all orders
const getAllOrders = asyncHandler(async (req, res) => {
    try {
        const allOrders = await Order.find().populate('products.product').populate("orderedby").exec(); // Updated from findOne to Find to get all orders
        res.json(allOrders);
    } catch (error) {
        throw new Error(error);
    }
});

// Gets all orders
const getOrderByUserId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const userOrders = await Order.findOne({ orderby: id}).populate('products.product').populate("orderedby").exec();
        res.json(userOrders);
    } catch (error) {
        throw new Error(error);
    }
});

const getOrders = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        const userOrders = await Order.findOne({ orderby: _id}).populate('products.product').populate("orderedby").exec();
        res.json(userOrders);
    } catch (error) {
        throw new Error(error);
    }
});

// Gets One Order made by individual

// const getOrder = asyncHandler(async (req, res) => {
//     const { _id } = req.user;
//     const { id } = req.params;
//     validateMongoDbId(_id);
//     try {
//         const userOrder = await Order.findOne({orderby: _id, _id: id}).populate('products.product').exec(); // Updated from findOne to Find to get all orders
//         res.json(userOrder);
//     } catch (error) {
//         throw new Error(error);
//     }
// });

// Update an Payment Method
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const updateOrderStatus = await Order.findByIdAndUpdate(
            id, 
            {
                orderStatus: status, 
                paymentMethod: {
                    status: status,
                },
            }, {
                new: true,
            }
        );
        res.json(updateOrderStatus);
    } catch (error) {
        throw new Error(error);
    }
})

module.exports = { 
    createUser, 
    loginUserCtrl, 
    getallUsers, 
    getWishlist,
    getaUser, 
    deleteUser, 
    updatedUser, 
    blockUser, 
    unblockUser, 
    handleRefreshToken, 
    logout, 
    updatePassword, 
    forgotPasswordToken, 
    resetPassword, 
    loginAdmin,
    saveAddress,
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    getAllOrders,
    getOrderByUserId,
    getOrders,
    updateOrderStatus,
};


