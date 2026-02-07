// Needed Resources
const express = require("express")
const accountRouter = new express.Router()
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')
const utilities = require("../utilities")

//Route for path that will be sent when the "My Account" link is clicked
accountRouter.get("/login", utilities.handleErrors(accountController.buildLogin))

//Route for when "Welcome __" link is clicked to go to account management page
accountRouter.get("/", utilities.handleErrors(accountController.buildAccountManagement))

//Route for path when the Register (Sign-Up) link is clicked
accountRouter.get("/register", utilities.handleErrors(accountController.buildRegistration))

//Route for Account Management, default route after login successful
accountRouter.get(
    "/",
    utilities.checkLogin, //checks for res.locals.logged in included in token
    utilities.handleErrors(accountController.buildAccountManagement)
)

//Route for posting the inputs on the registration form
accountRouter.post(
    "/register",
    regValidate.registationRules(), //Rules to be used in validation process
    regValidate.checkRegData, //Call to run validation and handle any errors
    utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
accountRouter.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
)

//Export Route Functions
module.exports = accountRouter;