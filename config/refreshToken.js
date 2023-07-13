const jwt = require("jsonwebtoken");

// Token for login sessions
const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {expiresIn: "3d"});
}

module.exports = { generateRefreshToken };