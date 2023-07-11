const jwt = require("jsonwebtoken");

// Token for login sessions
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {expiresIn: "3d"});
}

module.exports = {generateToken};