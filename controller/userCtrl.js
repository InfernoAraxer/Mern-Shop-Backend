const { generateToken } = require('../config/jwtToken');
const User = require('../models/userModel');
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require('../utils/validateMongodbId');
const { generateRefreshToken } = require('../config/refreshToken');
const jwt = require('jsonwebtoken');

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

module.exports = { createUser, loginUserCtrl, getallUsers, getaUser, deleteUser, updatedUser, blockUser, unblockUser, handleRefreshToken, logout };