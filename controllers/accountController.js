const accountModel = require("../models/account-model")
const utilities = require("../utilities")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

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
*  Deliver account management view
* *************************************** */
async function buildAccountManagement(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/index", {
        title: "Account Management",
        nav,
        errors: null
    })
}


/* ****************************************
*  Deliver update account view
* *************************************** */
async function buildUpdateAccount(req, res, next) {
    let nav = await utilities.getNav()
    //Collects and stores account_id from URL
    const account_id = parseInt(req.params.account_id)
    //Needs to have other info from database to pre-fill forms
    const accountData = await accountModel.getAccountById(account_id)

    res.render("account/update-account", {
        title: "Update My Account",
        nav,
        account_id: account_id,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
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


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
    //Retrieves and stores the navigation bar for use in the view
    let nav = await utilities.getNav()

    //Collects the incoming data from teh request body
    const { account_email, account_password } = req.body

    //Calls function from accountModel to locate data associated with account_email
    const accountData = await accountModel.getAccountByEmail(account_email)
    //Use if statement to determine if account exists
    if (!accountData) { 
        //Set flash message to be displayed if account does not exist
        req.flash("notice", "Please check your credentials and try again.") 
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
        return
    }

    //Determine if the incoming password and the hashed password from the database match
    try {
        //If passwords match, delete hashed password from accountData array
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password
            //Create JWT Token with accountData inserted as the payload, secret is read from .env file
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
            
            //If local testing (development), create cookie named jwt that stores the JWT token
            //If not development, has the option of secure:true which means the cookie can only be passed through HTTPS and not HTTP
            if (process.env.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 }) //Can only be passed through the HTTP protocol and can't be accessed by client-side JS, expires in 1 hour
            } else {
                res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
            }
            return res.redirect("/account/") //redirects to default account route
        }
        //If passwords don't match, display message and stay on login page
        else { 
            req.flash("message notice", "Please check your credentials and try again.")
            res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email,
            })
        }
    } catch (error) {
        throw new Error('Access Forbidden')
    }
}


/* ****************************************
*  Process Logout Request
* *************************************** */
async function accountLogout(req, res) {    
    //Clear cookie with jwt token
    res.clearCookie("jwt") //clearCookie is a built in function
    //Send message that user is logged out
    req.flash("notice", "You have logged out of your account.")
    //Redirect to home page
    return res.redirect("/")
}


/* ****************************************
*  Process Account Update for First Name, Last Name, and/or Email
* *************************************** */
async function updateAccountInfo(req, res) {
    //Retrieves and stores the navigation bar for use in the view
    let nav = await utilities.getNav()

    //Collects and stores the values from HTML form that are being sent from the browser in the body of the request object
    const { account_firstname, account_lastname, account_email, account_id } = req.body

    //Calls the function from the model
    const regResult = await accountModel.updateAccountInfo(
        account_firstname,
        account_lastname,
        account_email,
        account_id
    )

    //Determines if the result was received
    if (regResult) {
        //Set flash message to be displayed
        req.flash(
        "notice",
        `Congratulations, you\'ve updated the account for ${account_firstname} ${account_lastname} at ${account_email}.`
        )
        //Takes user back to management view
        res.status(201).render("account/index", {
            title: "Account Management",
            nav,
            errors: null,
            account_firstname, 
            account_lastname,
            account_email,
            account_id
        })
    } else {
        //Set flash message to be displayed
        req.flash("notice", "Sorry, the update failed.")
        //Returns to update view and sends error 501 (not successful) code
        res.status(501).render("account/update-account", {
            title: "Update My Account",
            nav,
            errors: null,
            account_firstname, 
            account_lastname,
            account_email,
            account_id
        })
    }
}

/* ****************************************
*  Process Account Update for Password
* *************************************** */
async function updatePassword(req, res) {
    //Retrieves and stores the navigation bar for use in the view
    let nav = await utilities.getNav()

    //Collects and stores the values from HTML form that are being sent from the browser in the body of the request object
    const { account_password, account_id } = req.body

    //Needs to have other info from database to pre-fill forms
    const accountData = await accountModel.getAccountById(account_id)

    //Hash the password before storing
    let hashedPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10) //10 is the "saltRound", or number of times the passwored will be sent through the hashing algorithm
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the update.')
        res.status(500).render("account/update-account", {
            title: "Update My Account",
            nav,
            account_id,
            account_firstname: accountData.account_firstname,
            account_lastname: accountData.account_lastname,
            account_email: accountData.account_email,
            errors: null,
        })
    }

    //Calls the function from the model
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword)

    //Determines if the result was received
    if (updateResult) {
        //Set flash message to be displayed
        req.flash(
        "notice",
        `Congratulations, you\'ve updated your password.`
        )
        //Takes user back to account management page
        res.status(201).render("account/index", {
            title: "Account Management",
            nav,
            account_id,
            account_firstname: accountData.account_firstname,
            account_lastname: accountData.account_lastname,
            account_email: accountData.account_email,
            errors: null,
        })
    } else {
        //Set flash message to be displayed
        req.flash("notice", "Sorry, the password change failed.")
        //Returns to update view and sends error 501 (not successful) code
        res.status(501).render("account/update-account", {
            title: "Update My Account",
            nav,
            account_id,
            account_firstname: accountData.account_firstname,
            account_lastname: accountData.account_lastname,
            account_email: accountData.account_email,
            errors: null,
        })
    }
}

//Export functions
module.exports = {
    buildLogin,
    buildRegistration,
    buildAccountManagement,
    buildUpdateAccount,
    registerAccount,
    accountLogin,
    accountLogout,
    updateAccountInfo,
    updatePassword
}