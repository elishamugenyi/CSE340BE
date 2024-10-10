//import packages to use in this route file as needed
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require("../utilities/account-validation") //add a require statement to bring the account-validation page, from the utilities folder into the routes scope.

//Route to build Login view
router.get("/login",accountController.buildLogin);

//Route to build Registration view
router.get("/register", accountController.buildRegister);

//route for posting/sending data to server. added the regValidate functions to be removed if not needed.
router.post(
    "/register",
    regValidate.registationRules(), 
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount))


// Process the login attempt temporarily because we do not have a login proces yet in this file or accountController files.
router.post(
    "/login",
    (req, res) => {
      res.status(200).send('login process')
    }
  )
module.exports = router;