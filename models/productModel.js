const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
        trim: true,
    },
    slug:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    description:{
        type: String,
        required: true,
        unique: true,
    },
    price:{
        type: Number,
        required: true,
    },
    category:{
        type: String,
        required: true,
    },
    brand:{
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    sold: {
        type: Number,
        default: 0,
        // select: false, // To Hide this number from users
    },
    images: [
        {
            public_id: String,
            url: String,
        },
    ], // When creating a product with images, you have to add the public_id/asset_id to it so they are connected
    color: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Color",
    }],
    tags: String,
    ratings:[
        {
            star: Number,
            comment: String,
            postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        },
    ],
    totalrating: {
        type: Number,
        default: 0,
    }, 
    },
    {
        timestamps: true
    }
);

//Export the model
module.exports = mongoose.model('Product', productSchema);  