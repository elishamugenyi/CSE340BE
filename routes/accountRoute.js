//import packages to use in this route file as needed
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const { check } = require("express-validator")
const regValidate = require("../utilities/account-validation") //add a require statement to bring the account-validation page, from the utilities folder into the routes scope.

//Route to build Login view
router.get("/login",accountController.buildLogin)

//Route to build Registration view
router.get("/register", accountController.buildRegister)

//Route for account management view
router.get("/account-management", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagementView))

// Route to display the account update view
router.get('/update/:account_id', accountController.buildUpdateAccountView)

// Route to process the account update
router.post('/update', /*[
  check('account_email').custom(async (account_email, { req }) => {
    const account = await accountController.getAccountByEmail(account_email)
    if (account && account.account_id !== req.body.account_id) {
      throw new Error('Email address already in use');
    }
  })
]*/ accountController.updateAccount);

// Route to process the password change
router.post('/change-password', [
  check('new_password').isLength({ min: 12 }).withMessage('Password must be at least 12 characters'),
  check('new_password').matches(/\d/).withMessage('Password must contain a number'),
  check ('new_password').matches(/[A-Z]/).withMessage('Password must contain a Capital Letter'),
  check('new_password').matches(/[!@#$%^&*]/).withMessage('Password must contain a special character')
], accountController.changePassword)

//route for posting/sending data to server. added the regValidate functions to be removed if not needed.
router.post(
    "/register",
    regValidate.registationRules(), 
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount))


// Process the login attempt temporarily because we do not have a login proces yet in this file or accountController files.
/*router.post(
    "/login",
    regValidate.loginRules(), 
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
  )*/
router.post("/login", accountController.accountLogin)

//route for loggin gout
router.get("/logout", accountController.logout)
module.exports = router;