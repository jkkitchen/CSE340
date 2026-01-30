const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}


/*  **********************************
  *  Add Classification Validation Rules
  * ********************************* */
  validate.addClassificationRules = () => {
    return [  
        //Classification Names cannot contain a space or special character of any kind
        body("classification_name")
            .trim()
            .notEmpty()        
            .withMessage("You must enter a value.")
            .isAlphanumeric("en-US") //contains only letter or numbers specific to locale en-US
            .withMessage("Classification Names cannot contain a space or special character.")   
    ]
}
  
/* ******************************
 * Check data and return errors or add to nav
 * ***************************** */
validate.checkClassificationName = async (req, res, next) => {
    const { classification_name } = req.body //this will be used to re-populate the form if there is an error
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) { //if there are errors
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", { //stay on current page
        errors,
        title: "Add Classification",
        nav,
        classification_name,
        })
        return
    }
    next() //if no errors then continues onto the controller for new classification to be added to database
}


module.exports = validate