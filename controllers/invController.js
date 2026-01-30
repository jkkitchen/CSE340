const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const invCont = {}

/* *******
 *Build inventory by classification view
 * ******* */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId 
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        title: className + " Vehicles",
        nav,
        grid,
    })
}

/* *******
 *Build inventory item detail view
 * ******* */
invCont.buildByInventoryId = async function (req, res, next) {
    const inv_id = req.params.inventoryId
    const data = await invModel.getInventoryByInventoryId(inv_id)
    const page = await utilities.buildInventoryItemPage(data)
    let nav = await utilities.getNav()

    //Get variables for title
    const invYearName = data.inv_year
    const invMakeName = data.inv_make //Don't need data[0] b/c it's only returning data for one car, not an array
    const invModelName = data.inv_model

    
    res.render("./inventory/invDetailsView", {
        title: `${invYearName} ${invMakeName} ${invModelName}`,
        nav,
        page,
    })
}



/* *******
 *Process Intentional Error (for testing, step 3 of week 3 assignment)
 * ******* */
invCont.throwError = async function (req, res) {
    throw new Error("I am an intentional error")
}


/* ****************************************
*  Deliver Management Page
* *************************************** */
invCont.buildManagement = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("inventory/management", {
        title: "Management",
        nav,
        errors: null
    })
}


/* ****************************************
*  Deliver Add New Classification form page
* *************************************** */
invCont.buildAddClassification = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: null
    })
}

/* ****************************************
*  Deliver Add New Inventory form page
* *************************************** */
invCont.buildAddInventory = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        errors: null
    })
}


/* *******
 *Add New Classification Name
 * ******* */
invCont.addClassification = async function (req, res) {
    //Retrieves and stores the navigation bar for use in the view
    let nav = await utilities.getNav()

    //Collects and stores the values from HTML form that are being sent from the browser in the body of the request object
    const { classification_name } = req.body

    //Calls the function from the model
    const regResult = await invModel.addNewClassificationName(
        classification_name
    )

    //Determines if the result was received
    if (regResult) {
        //Set flash message to be displayed
        req.flash("notice", `The new classification name has been added.`)
        //Reloads the page with the updated nav menu
        res.redirect("/inv/add-classification") //Redirects so the nav menu will update rather than doing status 201, have to use absolute path for this so used inv
    } else {
        //Set flash message to be displayed
        req.flash("notice", "New classification name not added. Please try again.")
        //Returns to registration view and sends error 501 (not successful) code
        res.status(501).render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: null,
        })
    }
}

 //Export Functions
module.exports = invCont