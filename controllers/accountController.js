const accountModel = require("../models/account-model")
const utilities = require("../utilities")
const bcrypt = require("bcryptjs")

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

    //Hash the password before storing
    let hashedPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10) //10 is the "saltRound", or number of times the passwored will be sent through the hashing algorithm
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.')
        res.status(500).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
        })
    }

    //Calls the function from the model
    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
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
        errors: null,
        })
    } else {
        //Set flash message to be displayed
        req.flash("notice", "Sorry, the registration failed.")
        //Returns to registration view and sends error 501 (not successful) code
        res.status(501).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
        })
    }
}

//Export functions
module.exports = { buildLogin, buildRegistration, registerAccount }