const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")
const accountModel = require("../models/account-model")
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


/* ****************************************
*  Deliver modify review view
* *************************************** */
reviewCont.buildModifyReview = async function (req, res, next) {
    let nav = await utilities.getNav()
    //Collects and stores review_id from URL
    const review_id = Number(req.params.review_id)
    //Needs to have other info from database to pre-fill forms
    const review = await reviewModel.getReviewById(review_id)

    //Check to make sure review exists
    if (!review) {
        req.flash("notice", "Review does not exist.")
        return res.redirect("/account/")
    }

    //Get inventory data for header
    const invData = await invModel.getInventoryByInventoryId(review.inv_id)

    res.render("account/modify-review", {
        title: "Modify Review",
        nav,
        inv_year: invData.inv_year,
        inv_make: invData.inv_make,
        inv_model: invData.inv_model,
        review_text: review.review_text,
        inv_id: review.inv_id,
        review_id: review_id,
        errors: null
    })
}

/* *******
 *Modify Review
 * ******* */
reviewCont.modifyReview = async function (req, res, next) {
    //Retrieves and stores the navigation bar for use in the view
    let nav = await utilities.getNav()

    //Collects and stores the values from HTML form that are being sent from the browser in the body of the request object
    const { review_id, review_text, inv_id } = req.body

    //Get account_id from JWT Token
    const tokenAccountId = Number(res.locals.accountData.account_id)

    //Calls the function from the model
    const updateResult = await reviewModel.modifyReview(review_id, review_text, tokenAccountId)    

    //Determines if the result was received
    if (updateResult) {
        //Displays message
        req.flash("notice", `The review was successfully updated.`)
        //Redirects to account management page
        res.redirect("/account/")
    } else {
        //Displays message
        req.flash("notice", "Sorry, the modification failed.")
        //Call info needed to render page again        
        const invData = await invModel.getInventoryByInventoryId(inv_id)        
        //Reloads modify review page 
        res.status(500).render("account/modify-review", {
        title: "Modify Review",
        nav,
        inv_year: invData.inv_year,
        inv_make: invData.inv_make,
        inv_model: invData.inv_model,
        review_text: review_text,
        inv_id: inv_id,
        review_id: review_id,
        errors: null
        })
    }
}

/* ***************************
 *  Deliver Delete Review View
 * ************************** */
reviewCont.buildDeleteReview = async function (req, res, next) {
    let nav = await utilities.getNav()
    //Collects and stores review_id from URL
    const review_id = Number(req.params.review_id)

    //Pull data from database to pre-fill forms
    const review = await reviewModel.getReviewById(review_id)

    //Check to make sure review exists
    if (!review) {
        req.flash("notice", "Review does not exist.")
        return res.redirect("/account/")
    }

    //Format date
    const review_date = new Date(review.review_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    })

    //Get inventory data for header
    const invData = await invModel.getInventoryByInventoryId(review.inv_id)

    res.render("account/delete-review", {
        title: "Delete Review",
        nav,
        inv_year: invData.inv_year,
        inv_make: invData.inv_make,
        inv_model: invData.inv_model,
        review_date: review_date,
        review_text: review.review_text,
        inv_id: review.inv_id,
        review_id: review_id,
        errors: null
    })
}

/* *******
 *Delete Review
 * ******* */
reviewCont.deleteReview = async function (req, res, next) {
    //Retrieves and stores the navigation bar for use in the view
    let nav = await utilities.getNav()

    //Collects and stores review_id from URL
    const review_id = Number(req.body.review_id)

    //Get account_id from JWT Token
    const tokenAccountId = Number(res.locals.accountData.account_id)

    //Calls the function from the model
    const deleteReview = await reviewModel.deleteReview(review_id, tokenAccountId)    

    //Determines if the data was deleted
    if (deleteReview === 1) { //if it equals one then the data was deleted
        //Displays message
        req.flash("notice", `The review was successfully deleted.`)
        //Redirects to account management page
        res.redirect("/account/")
    } else {
        //Displays message
        req.flash("notice", "Sorry, the deletion failed.")
        //Get data needed to re-render page
        const review = await reviewModel.getReviewById(review_id)
        const invData = await invModel.getInventoryByInventoryId(review.inv_id)
        //Reloads delete review page
        res.render("account/delete-review", {
            title: "Delete Review",
            nav,
            inv_year: invData.inv_year,
            inv_make: invData.inv_make,
            inv_model: invData.inv_model,
            review_date: review.review_date,
            review_text: review.review_text,
            inv_id: review.inv_id,
            review_id: review_id,
            errors: null
        })
    }

}

module.exports = reviewCont