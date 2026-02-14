// Needed Resources
const express = require("express")
const router = new express.Router()
const reviewController = require("../controllers/reviewController")
const utilities = require("../utilities")
const reviewValidate = require("../utilities/review-validation")

//Process add review form inputs from inventory detail pages
router.post(
    "/add-review",
    reviewValidate.addReviewRules(),
    utilities.handleErrors(reviewValidate.checkReviewInputs),
    utilities.handleErrors(reviewController.addReview)
)

//Route for "Modify" link for reviews on Account Management page
router.get(
    "/modify/:review_id",
    utilities.checkLogin,
    utilities.checkAccountId,
    utilities.handleErrors(reviewController.buildModifyReview)
)

//Process modify review form inputs
router.post(
    "/modify-review",
    utilities.checkLogin, 
    utilities.checkAccountId,
    reviewValidate.addReviewRules(),
    utilities.handleErrors(reviewValidate.checkModifyReviewInputs),
    utilities.handleErrors(reviewController.modifyReview)
)

//Route for "Delete" link for reviews on Account Management page
router.get(
    "/delete/:review_id",
    utilities.checkLogin,
    utilities.checkAccountId,
    utilities.handleErrors(reviewController.buildDeleteReview))

//Process delete review confirmation
router.post(
    "/delete-review",
    utilities.checkLogin,
    utilities.checkAccountId,
    utilities.handleErrors(reviewController.deleteReview))

//Export Route Functions
module.exports = router;