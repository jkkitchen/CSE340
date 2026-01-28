const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
  
/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  validate.registationRules = () => {
    return [
        // firstname is required and must be string
        body("account_firstname")
            .trim() //trims whitespace
            .escape() //replaces <,>.&.',",`,/,\ with HTML entities
            .notEmpty() //checks there is a value entered
            .isLength({ min: 1 }) //checks length is greater than 1
            .withMessage("Please provide a first name."), // on error this message is sent.
  
        // lastname is required and must be string
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 }) //checks length is greater than 2
            .withMessage("Please provide a last name."), // on error this message is sent.
  
        // valid email is required and cannot already exist in the DB
        body("account_email")
        .trim()
        .escape()
        .notEmpty()
        .isEmail() //checks is string is an email
        .normalizeEmail() //canonicalize an e-mail (makes all letter lowercase, removes dots, removes sub-addresses)
        .withMessage("A valid email is required."),
  
        // password is required and must be strong password
        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({ //checks if string can be considered a strong password
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."),
    ]
}
  
/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body //these will be used to re-populate the form if there is an error, password is not stored and re-populated
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) { //if there are errors
        let nav = await utilities.getNav()
        res.render("account/register", {
        errors,
        title: "Registration",
        nav,
        account_firstname,
        account_lastname,
        account_email,
        })
        return
    }
    next() //if no errors then continues onto the controller for registration to be carried out
}

module.exports = validate