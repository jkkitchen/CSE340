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


/*  **********************************
  *  Add Inventory Validation Rules
  * ********************************* */
validate.addInventoryRules = () => {
    return [  
        //Classification Names cannot contain a space or special character of any kind
        body("classification_id") //select name is classification_id even classification_name is what shows      
            .notEmpty()        
            .withMessage("You must select a value."),
        body("inv_make")
            .trim()            
            .notEmpty()            
            .withMessage("Please provide car make."), // on error this message is sent.
        body("inv_model")
            .trim()            
            .notEmpty()            
            .withMessage("Please provide car model."), // on error this message is sent.
        body("inv_year")            
            .notEmpty()
            .withMessage("Year is required.")
            .bail() //So if it's empty it will only show the "Year is required" message.
            .isInt({min: 1900, max: 2099}) //checks that number is an integer and in valid range            
            .withMessage("Year must be a 4-digit number."), // on error this message is sent.
        body("inv_description")
            .trim()            
            .notEmpty()            
            .withMessage("Please provide a description."), // on error this message is sent.
        body("inv_image")
            .trim()            
            .notEmpty()            
            .withMessage("Please provide the file path for car image."), // on error this message is sent.
        body("inv_thumbnail")
            .trim()            
            .notEmpty()            
            .withMessage("Please provide the file path for car thumbnail."), // on error this message is sent.
        body("inv_price")
            .trim()            
            .notEmpty()
            .withMessage("Price is required.")
            .bail() //So it will only show the first error message if field is left blank
            .isInt({min:1}) //checks number is an integer and no commas are entered            
            .withMessage("Price must be entered as a whole number with no commas."), // on error this message is sent.
        body("inv_miles")
            .trim()            
            .notEmpty()
            .withMessage("Mileage is required.")
            .bail() //So it will only show the first error message if field is left blank
            .isInt({min:0}) //checks number is an integer and no commas are entered            
            .withMessage("Mileage must be entered as a whole number with no commas."), // on error this message is sent.
        body("inv_color")
            .trim()            
            .notEmpty()            
            .withMessage("Please provide car color.") // on error this message is sent.
    ]
}
  
/* ******************************
 * Check data from new inventory form and return errors
 * ***************************** */
validate.checkInventoryInputs = async (req, res, next) => {
    const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body //this will be used to re-populate the form if there is an error
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) { //if there are errors
        let nav = await utilities.getNav()
        let classificationList = await utilities.buildClassificationList(classification_id)
        res.render("inventory/add-inventory", { //stay on current page?
            errors,
            title: "Add Inventory",
            nav,
            classificationList,
            classification_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,        
        })
        return
    }
    next() //if no errors then continues onto the controller for new inventory to be added to database
}

/* ******************************
 * Check data from modify inventory form and return errors
 * ***************************** */
validate.checkModifyInputs = async (req, res, next) => {
    const { classification_id, inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body //this will be used to re-populate the form if there is an error
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) { //if there are errors
        let nav = await utilities.getNav()
        let invTitle = `${inv_year} ${inv_make} ${inv_model}`
        let classificationList = await utilities.buildClassificationList(classification_id)
        res.render("inventory/modify-inventory", { //stay on current page?
            errors,
            title: invTitle,
            nav,
            classificationList,
            classification_id,
            inv_id, 
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,        
        })
        return
    }
    next() //if no errors then continues onto the controller for new inventory to be added to database
}

module.exports = validate