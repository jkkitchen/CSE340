const invModel = require("../models/inventory-model")
const reviewModel = require("../models/review-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* **********
 * Constructs the nav HTML unordered list
 * ******** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    console.log(data)
    let list = "<ul>"
    list += '<li><a href="/" title="Home Page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' Vehicles">' +
            row.classification_name +
            "</a>"
        list += "</li>"
    })
    list += "</ul>"
    return list 
}

/* **********
* Build the classification view HTML
 * ******** */
Util.buildClassificationGrid = async function (data) {
    let grid
    if (data.length > 0) {
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            grid += '<li>'
            grid += '<a href="/inv/detail/' + vehicle.inv_id //Switched to absolute path rather than relative
                + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
                + ' details"><img src="' + vehicle.inv_thumbnail
                + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
                + ' on CSE Motors" /></a>'
            grid += '<div class="namePrice">'
            grid += '<hr />'
            grid += '<h2>'
            grid += '<a href="/inv/detail/' + vehicle.inv_id + '" title="View ' //Switched to absolute path rather than relative
                + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
                + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$'
                + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'
        })
        grid += '</ul>'
    } else {
        grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>' //Got rid of += and made it = b/c it has not been assigned yet
    }
    return grid
}


/* **********
* Build the page for each inventory item
 * ******** */
Util.buildInventoryItemPage = async function (vehicleData) {
    let pageContent
    if (vehicleData) { //Changed this from a loop because the data being used in this function will be for one vehicle (the function only returns one row of data)
        pageContent = `       
            <div id="img-and-details">
                <img src="${vehicleData.inv_image}" alt = "Image of ${vehicleData.inv_make} ${vehicleData.inv_model}" />
                <div id="details">
                    <h2>Price: <span>$${new Intl.NumberFormat('en-US').format(vehicleData.inv_price)}</span></h2>                
                    <div id="detail-text">
                        <p><strong>Mileage: </strong><span>${new Intl.NumberFormat('en-US').format(vehicleData.inv_miles)}</span></p>
                        <p><strong>Color: </strong>${vehicleData.inv_color}</p>
                        <p>${vehicleData.inv_description}</p>     
                    </div>
                    <h2>Call Us Now at 856-968-8989</h2>
                </div>
            </div>`  
    } else {
        pageContent = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return pageContent
}


/* **********
* Middleware for Handling Errors
*Wrap other functions in this for General Error handling
 * ******** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


/* **********
* Build the dropdown menu for classification name in the Add Inventory form
 * ******** */
Util.buildClassificationList = async function (classification_id = null) {
    //Pull classification names and id's from database using function in inventory model file
    let data = await invModel.getClassifications()
    //Write html for drop-down menu to include all classification names pulled from the database
    let classificationList = `
        <select name="classification_id" id="classificationList" required> 
            <option value=''>Choose a Classification</option>` //Added code to make it sticky
    data.rows.forEach((row) => {
        classificationList += `<option value="${row.classification_id}"`
        //Use if statement to determine if classification_id is in database
        if (classification_id != null && row.classification_id == classification_id) {
            classificationList += ` selected `
        } 
        //Add classification name for user to see
        classificationList += `>${row.classification_name}</option >`        
    })
    classificationList += `</select>`

    return classificationList
}


/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
    if (req.cookies.jwt) { //check if JWT cookie exists
        jwt.verify( //check validity of token
            req.cookies.jwt, //JWT Token
            process.env.ACCESS_TOKEN_SECRET, //"secret" from .env file
            function (err, accountData) { //callback function which returns an error or the account data from token payload
                if (err) {
                    req.flash("notice", "Please log in")
                    res.clearCookie("jwt") //cookie deleted
                    return res.redirect("/account/login")
                }
                res.locals.accountData = accountData
                res.locals.loggedin = 1
                if (res.locals.accountData.account_type === "Employee" || res.locals.accountData.account_type === "Admin") {
                    res.locals.accessLevel = 1
                } else {
                    res.locals.accessLevel = 0
                }
                next()
            }
        )
    } else { //no JWT cookie
        res.locals.loggedin = 0
        res.locals.accessLevel = 0
        next()
    }
}


/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

/* ****************************************
 *  Check Account Type for Employee or Admin
 * ************************************ */
Util.checkAccountType = (req, res, next) => {    
    if (res.locals.accountData) { //Checks if account data exists, which would mean checking if they're logged in
        if (res.locals.accessLevel === 1) { //1 will mean they have access to inventory management tools            
            next()
        } else { //0 will mean they do NOT have access to inventory management tools            
            req.flash("notice", "Not authorized to view inventory management pages.")
            return res.redirect("/account/")        
        }
    } else {
        req.flash("notice", "Please log in.")
        return res.redirect("/account/login")
    }
}


/* ****************************************
 *  Check Account ID for Modifying Reviews
 * ************************************ */
Util.checkAccountId = async (req, res, next) => {    
    //Collect and store review_id from URL for loading modify review page, store review_id from POST request for submitting form for modification and deletion
    const review_id = Number(req.params.review_id) || Number(req.body.review_id)
    //Check if the review id exists
    if (!review_id) {
        req.flash("notice", "Review ID does not exist.")
        return res.redirect("/account/")
    }
        
    //Get review from database using review_id
    const review = await reviewModel.getReviewById(review_id)
    //Check if the review exists
    if (!review) {
        req.flash("notice", "Review does not exist.")
        return res.redirect("/account/")
    }

    //Get account_id from database
    const account_id = review.account_id
    //Get account_id from JWT Token
    const tokenAccountId = Number(res.locals.accountData.account_id)
    //Check if they match
    if (account_id !== tokenAccountId) { //do not match    
        req.flash("notice", "You may not modify a review not not associated with your account.")
        return res.redirect("/account/")        
    } else { //match
        next()
    }
}

module.exports = Util