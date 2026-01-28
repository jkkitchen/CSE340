// Needed Resources
const express = require("express")
const accountRouter = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")

//Route for path that will be sent when the "My Account" link is clicked
accountRouter.get("/login", utilities.handleErrors(accountController.buildLogin))

//Route for path when the Register (Sign-Up) link is clicked
accountRouter.get("/register", utilities.handleErrors(accountController.buildRegistration))

// //Error Route
// accountRouter.get("/broken", utilities.handleErrors(accountController.throwError))


//Export Route Functions
module.exports = accountRouter;