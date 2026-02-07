// Needed Resources
const express = require("express")
const accountRouter = new express.Router()
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')
const utilities = require("../utilities")

//Route for path that will be sent when the "My Account" link is clicked
accountRouter.get("/login", utilities.handleErrors(accountController.buildLogin))

//Route for Account Management (also when "Welcome __" link is clicked)
accountRouter.get(
    "/",
    utilities.checkLogin,
    utilities.handleErrors(accountController.buildAccountManagement)
)

//Route for path when the Register (Sign-Up) link is clicked
accountRouter.get("/register", utilities.handleErrors(accountController.buildRegistration))

//Route for posting the inputs on the registration form
accountRouter.post(
    "/register",
    regValidate.registrationRules(), //Rules to be used in validation process
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

//Route for updating account information
accountRouter.get("/update-account/:account_id", utilities.handleErrors(accountController.buildUpdateAccount))

//Process account update for first name, last name, and email
accountRouter.post(
    "/update-account-info",
    regValidate.accountUpdateRules(), //Rules to be used in validation process
    regValidate.checkAccountUpdateData, //Call to run validation and handle any errors
    utilities.handleErrors(accountController.updateAccountInfo)
)

//Process account update for password
accountRouter.post(
    "/update-password",
    regValidate.passwordUpdateRules(), //Rules to be used in validation process
    regValidate.checkPasswordUpdateData, 
    utilities.handleErrors(accountController.updatePassword)
)

//Export Route Functions
module.exports = accountRouter;