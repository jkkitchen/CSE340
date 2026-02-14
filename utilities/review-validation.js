const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")


/*  **********************************
  *  Inventory Reviews Validation Rules
  * ********************************* */
  validate.addReviewRules = () => {
    return [
        // review text is required and must be string
        body("review_text")
            .trim() //trims whitespace
            .escape() //replaces <,>.&.',",`,/,\ with HTML entities
            .notEmpty() //checks there is a value entered            
            .withMessage("Please provide a review."), // on error this message is sent.
    ]
}

/* ******************************
 * Check data from new review form and return errors
 * ***************************** */
validate.checkReviewInputs = async (req, res, next) => {
    const { review_text, inv_id } = req.body //this will be used to re-populate the form if there is an error
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) { //if there are errors
        let nav = await utilities.getNav()
        
        //Get variables for title
        const data = await invModel.getInventoryByInventoryId(inv_id)        
        const invYearName = data.inv_year
        const invMakeName = data.inv_make //Don't need data[0] b/c it's only returning data for one car, not an array
        const invModelName = data.inv_model

        //Get other info to build page
        const page = await utilities.buildInventoryItemPage(data)
        const reviews = await reviewModel.getReviewsByInventoryId(inv_id) //previous reviews, not the current one being validated

        res.render("inventory/invDetailsView", { //stay on current page?
            errors,
            title: `${invYearName} ${invMakeName} ${invModelName}`,
            nav,
            inv_id,
            page,
            reviews,
            review_text                   
        })
        return
    }
    next() //if no errors then continues onto the controller for new review to be added to database
}

/* ******************************
 * Check data from modify review form and return errors
 * ***************************** */
validate.checkModifyReviewInputs = async (req, res, next) => {
    const { review_id, review_text, inv_id } = req.body //this will be used to re-populate the form if there is an error
    let errors = validationResult(req)
    if (!errors.isEmpty()) { //if there are errors
        let nav = await utilities.getNav()
        
        //Call info needed to render page again        
        const invData = await invModel.getInventoryByInventoryId(inv_id)        
        //Reloads modify review page 
        res.status(400).render("account/modify-review", { //400 is bad request, not server failure
            errors,
            title: "Modify Review",
            nav,
            inv_year: invData.inv_year,
            inv_make: invData.inv_make,
            inv_model: invData.inv_model,
            review_text: review_text,
            inv_id: inv_id,
            review_id: review_id
        })
        return
    }
    next() //if no errors then continues onto the controller for modified review to be added to database
}


module.exports = validate