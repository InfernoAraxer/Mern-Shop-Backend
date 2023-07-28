const bodyParser = require('body-parser');
const express = require('express');
const dbConnect = require('./config/dbConnect');
const app = express();
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 4000;
const authRouter = require('./routes/authRoute');
const productRouter = require('./routes/productRoute');
const blogRouter = require('./routes/blogRoute');
const productCategoryRouter = require('./routes/productCategoryRoute');
const blogCategoryRouter = require('./routes/blogCategoryRoute');
const brandRouter = require('./routes/brandRoute');
const colorRouter = require('./routes/colorRoute');
const couponRouter = require('./routes/couponRoute');
const enqRouter = require('./routes/enqRoute');
const uploadRouter = require('./routes/uploadRoute');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const cookieParser = require("cookie-parser");
const morgan = require('morgan');
const cors = require('cors');
dbConnect();

// All of the Libraries/Modules being used
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.use('/api/user', authRouter);
app.use('/api/product', productRouter);
app.use('/api/blog', blogRouter);
app.use('/api/category', productCategoryRouter);
app.use('/api/blogcategory', blogCategoryRouter);
app.use('/api/brand', brandRouter);
app.use('/api/color', colorRouter);
app.use('/api/coupon', couponRouter);
app.use('/api/enquiry', enqRouter);
app.use('/api/upload', uploadRouter);

// Middlewares
app.use(notFound);
app.use(errorHandler);
 
app.listen (PORT, () => {
    console.log(`Server is running at PORT ${PORT}`);
}) 

// npm i bcrypt body-parser cloudinary cookie-parser cors dotenv express express-async-handler jsonwebtoken mongoose morgan multer nodemailer sharp slugify uniqid
