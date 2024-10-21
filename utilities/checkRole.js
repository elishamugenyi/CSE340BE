// utilities/checkRole.js
require ("dotenv").config()
const jwt = require("jsonwebtoken")

function checkRole(allowedRoles) {
  return (req, res, next) => {
    const token = req.cookies.jwt

    if (!token) {
      req.flash("notice", "Please log in to access this page.")
      return res.redirect("/account/login")
    }

    try {
      // Verify JWT
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

      // Check if user has the correct role
      if (!allowedRoles.includes(decoded.account_type)) {
        next() //proceed if roles match
      } else {
        req.flash("notice", "You do not have permission to access this page.")
        return res.redirect("/account/account-management")
      }
    } catch (error) {
      console.error("JWT verification error:", error)
      req.flash("notice", "Please log in again.")
      return res.redirect("/account/login")
    }
  }
}

module.exports = checkRole
