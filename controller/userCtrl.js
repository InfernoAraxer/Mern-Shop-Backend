const { generateToken } = require('../config/jwtToken');
const User = require('../models/userModel');
const asyncHandler = require("express-async-handler");
const { validateMongoDbId } = require('../utils/validateMongodbId');

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

module.exports = { createUser, loginUserCtrl, getallUsers, getaUser, deleteUser, updatedUser, blockUser, unblockUser };