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

 //Export Functions
module.exports = invCont