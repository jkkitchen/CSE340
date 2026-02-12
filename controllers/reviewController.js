const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities")
const reviewCont = {}

/* *******
 *Add New Review
 * ******* */
reviewCont.addReview = async function (req, res) {
    //Collects and stores the values from HTML form that are being sent from the browser in the body of the request object
    const { review_text, inv_id } = req.body
    const account_id = res.locals.accountData.account_id
       
    try {
        //Calls the function from the model to add review to database
        await reviewModel.addNewReview(review_text, inv_id, account_id)        
        //Set flash message to be displayed
        req.flash("notice", `The new review has been added.`)
        //Redirects (goes through GET function on inventory to build page)
        res.redirect(`/inv/detail/${inv_id}`) //Redirects so the new review will be shown
    } catch (error) {
        //Set flash message to be displayed
        req.flash("notice", "New review not added. Please try again.")
        console.error("addReview controller error:", error)

        //Pull info to render page
        //Nav menu
        let nav = await utilities.getNav()

        //Title
        const data = await invModel.getInventoryByInventoryId(inv_id)        
        const invYearName = data.inv_year
        const invMakeName = data.inv_make //Don't need data[0] b/c it's only returning data for one car, not an array
        const invModelName = data.inv_model
        //Inventory Details Content
        const page = await utilities.buildInventoryItemPage(data)
        //Previous Reviews
        const reviews = await reviewModel.getReviewsByInventoryId(inv_id) //previous reviews, not the current one being validated

        //Returns to inventory details view and sends error 500 (insert fails) code
        res.status(500).render("inventory/invDetailsView", {
            nav,
            errors: null,
            title: `${invYearName} ${invMakeName} ${invModelName}`,            
            inv_id,
            page,
            reviews,
            review_text   
        })
    }
}

module.exports = reviewCont