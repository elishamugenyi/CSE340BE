//only required for now is utilities
require("dotenv").config()
const utilities = require("../utilities/")
const accountModel = require("../models/account-model") //require the account-model function to be used here.
const jwt = require("jsonwebtoken")
const bcrypt = require ("bcrypt")
const { validationResult } = require("express-validator")

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
      jwt: req.cookies.jwt //passing the JWT Token if it exists
    })
  }
  
/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    jwt: req.cookies.jwt //passing the JWT Token if it exists
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  const hashedPassword = await bcrypt.hash(account_password, 10)

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null
    })
  }
}
/* ****************************************
*  Process Login 
* *************************************** */

async function accountLogin(req, res) {
  //console.log("Request Body:",req.body)//log form data.
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  //console.log("Account Data", accountData) //check account data if it is retrieved.
  
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }

  try {
    // Compare the password with the hashed password in the database
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      //console.log("password match", accountData.account_password)

      // Create a JWT token for the authenticated user
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      //console.log("Generated JWT:", accessToken)
      
      // Set the JWT as a cookie
      res.cookie("jwt", accessToken, { httpOnly: true, secure: process.env.NODE_ENV !== 'development', maxAge: 3600 * 1000 })
      //console.log('JWT Token Set:', accessToken) // Debugging to check if token is being set

      //clear any existing flash messages on successful login
      req.flash("notice", null)
      
      return res.redirect("/account/account-management")
    } else {
      //set flash message only when password is invalid
      req.flash("notice", "Invalid password, please try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).send('Login failed due to server error')
  }
}

/* ****************************************
*  Account Management View
* *************************************** */
async function buildAccountManagementView(req, res) {
  let nav = await utilities.getNav()
  /*if (!registerAccount.cookies.jwt)*/
  if (!req.cookies.jwt) {
    req.flash("notice", "Please login to access the account management.")
    //Redirect if no valid JWT is found
    return res.redirect('/account/login')
  }
  try {
    //Verify the JWT and extract the account information
    const decoded = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET)

    //only pass the flash message if one exists
    const messages = req.flash("notice")

    res.render('account/account-management', {
      title: 'Account Management',
      nav,
      messages: messages.length > 0 ? messages : null,/*req.flash('notice')*/
      errors: null,
      account_firstname: decoded.account_firstname, //pass the user's firstname to the view
      account_id: decoded.account_id,
      account_type: decoded.account_type,
      jwt: req.cookies.jwt //passing the JWT Token if it exists
    })
  } catch (error) {
    console.error("Error rendering the account management view: ", error)
    res.status(500).send('Server Error')
  }
}

/* ****************************************
*  Deliver update account view
* *************************************** */
async function buildUpdateAccountView(req, res) {
  let nav = await utilities.getNav()
  if (!req.cookies.jwt) {
    req.flash("notice", "Please log in to update your account.")
    return res.redirect('/account/login')
  }

  try {
    const decoded = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET)
    const account = await accountModel.getAccountById(decoded.account_id)

    res.render('account/update', {
      title: 'Update Account Information',
      nav,
      errors: null,
      messages: req.flash('notice'),
      account_firstname: account.account_firstname,
      account_lastname: account.account_lastname,
      account_email: account.account_email,
      account_id: account.account_id,
    })
  } catch (error) {
    console.error('Error loading update account view: ', error)
    res.status(500).send('Server error')
  }
}

/* ****************************************
*  Process account update
* *************************************** */
async function updateAccount(req, res) {
  let nav = await utilities.getNav()
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.render('account/update', {
      title: 'Update Account Information',
      nav,
      errors: errors.array(),
      messages: req.flash('notice'),
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
      account_id: req.body.account_id,
    })
  }

  try {
    const result = await accountModel.updateAccountInfo(req.body.account_id, req.body.account_firstname, req.body.account_lastname, req.body.account_email)
    if (result) {
      req.flash('notice', 'Account information updated successfully.')
      return res.redirect('/account/management')
    } else {
      req.flash('notice', 'Failed to update account information.')
      return res.redirect('/account/update')
    }
  } catch (error) {
    console.error('Error updating account: ', error)
    res.status(500).send('Server error')
  }
}

/* ****************************************
*  Process password change
* *************************************** */
async function changePassword(req, res) {
  let nav = await utilities.getNav();
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render('account/update', {
      title: 'Update Account Information',
      nav,
      errors: errors.array(),
      messages: req.flash('notice'),
      account_id: req.body.account_id,
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(req.body.new_password, 10)
    const result = await accountModel.updateAccountPassword(req.body.account_id, hashedPassword)

    if (result) {
      req.flash('notice', 'Password changed successfully.')
      return res.redirect('/account/management')
    } else {
      req.flash('notice', 'Failed to change password.')
      return res.redirect('/account/update')
    }
  } catch (error) {
    console.error('Error changing password: ', error)
    res.status(500).send('Server error')
  }
}

/* ****************************************
*  Logout Functionality 
* *************************************** */
function logout(req, res) {
  res.clearCookie("jwt"); // Clear the JWT cookie
  req.flash("notice", "You have successfully logged out.");
  res.redirect("/"); // Redirect to home page or login page after logout
}

module.exports = { 
  buildLogin, 
  buildRegister, 
  registerAccount, 
  accountLogin, 
  buildAccountManagementView,
  logout,
  buildUpdateAccountView,
  updateAccount,
  changePassword }
