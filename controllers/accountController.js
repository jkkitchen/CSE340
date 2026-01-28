const accountModel = require("../models/account-model")
const utilities = require("../utilities")

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null
    })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegistration(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null
    })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    //Retrieves and stores the navigation bar for use in the view
    let nav = await utilities.getNav()
    //Collects and stores the values from HTML form that are being sent from the browser in the body of the request object
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    //Calls the function from the model
    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )

    //Determines if the result was received
    if (regResult) {
        //Set flash message to be displayed
        req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
        )
        //Takes user back to login page to enter username and password
        res.status(201).render("account/login", {
        title: "Login",
        nav,
        })
    } else {
        //Set flash message to be displayed
        req.flash("notice", "Sorry, the registration failed.")
        //Returns to registration view and sends error 501 (not successful) code
        res.status(501).render("account/register", {
        title: "Registration",
        nav,
        })
    }
}

//Export functions
module.exports = { buildLogin, buildRegistration, registerAccount }