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

//Export Route Functions
module.exports = router;