const Blog = require('../models/blogModel');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require("../utils/validateMongodbId");

const createBlog = asyncHandler(async (req, res) => {
    try {
        const newBlog = await Blog.create(req.body);
        res.json({newBlog});
    } catch (error) {
        throw new Error(error);
    }
})

const updateBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const updateBlog = await Blog.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        res.json({updateBlog});
    } catch (error) {
        throw new Error(error);
    }
})

const getBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const getBlog = await Blog.findById(id).populate('likes').populate('dislikes');
        const updateViews = await Blog.findByIdAndUpdate(id, {
            $inc: {numViews:1},
        }, {
            new: true,
        })
        res.json(getBlog);
    } catch (error) {
        throw new Error(error);
    }
})

const getAllBlogs = asyncHandler(async (req, res) => {
    try {
        const getBlogs = await Blog.find();
        res.json(getBlogs);
    } catch (error) {
        throw new Error(error);
    }
})

const deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deleteBlog = await Blog.findByIdAndDelete(id);
        res.json({deleteBlog});
    } catch (error) {
        throw new Error(error);
    }
})

const liketheBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    validateMongoDbId(blogId);

    // Find the Blog that you want to like
    const blog = await Blog.findById(blogId);
    // Find the logged in User
    const loginUserId = req?.user?._id;
    // Find if the user has already liked the post
    const isLiked = blog?.isLiked;
    // Find the user if he disliked the post
    const alreadyDisliked = blog?.dislikes?.find((userId) => userId?.toString() === loginUserId?.toString());
    if (alreadyDisliked) {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $pull: {dislikes: loginUserId},
            isDisliked: false,
        }, {
            new: true,
        });
        res.json(blog);
    }

    if (isLiked) {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $pull: {likes: loginUserId},
            isLiked: false,
        }, {
            new: true,
        });
        res.json(blog);
    } else {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $push: {likes: loginUserId},
            isLiked: true,
        }, {
            new: true,
        });
        res.json(blog);
    }
})

const disliketheBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    validateMongoDbId(blogId);

    // Find the Blog that you want to like
    const blog = await Blog.findById(blogId);
    // Find the logged in User
    const loginUserId = req?.user?._id;
    // Find if the user has already disliked the post
    const isDisliked = blog?.isDisliked;
    // Find the user if he liked the post
    const alreadyLiked = blog?.likes?.find((userId) => userId?.toString() === loginUserId?.toString());

    if (alreadyLiked) {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $pull: { likes: loginUserId},
            isLiked: false,
        }, {
            new: true,
        });
        res.json(blog);
    }

    if (isDisliked) {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $pull: {dislikes: loginUserId},
            isDisliked: false,
        }, {
            new: true,
        });
        res.json(blog);
    } else {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $push: {dislikes: loginUserId},
            isDisliked: true,
        }, {
            new: true,
        });
        res.json(blog);
    }
})

module.exports = { createBlog, updateBlog, getBlog, getAllBlogs, deleteBlog, liketheBlog, disliketheBlog };