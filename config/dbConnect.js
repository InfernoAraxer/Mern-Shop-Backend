const { default: mongoose } = require("mongoose")

const dbConnect = () => {
    try {
        mongoose.set("strictQuery", true);
        const conn = mongoose.connect(process.env.MONGODB_URL);
        console.log("Database Connected Successfully");
    } catch (error) {
        console.log("Database Error");
        throw new Error(error);
    }
};

module.exports = dbConnect;