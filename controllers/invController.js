const invModel = require("../models/inventory-model")
const reviewModel = require("../models/review-model")
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
    
    //Call functions needed for the inventory details page
    let nav = await utilities.getNav()
    const data = await invModel.getInventoryByInventoryId(inv_id)
    const page = await utilities.buildInventoryItemPage(data)
    const reviews = await reviewModel.getReviewsByInventoryId(inv_id)
    
    //Get variables for title
    const invYearName = data.inv_year
    const invMakeName = data.inv_make //Don't need data[0] b/c it's only returning data for one car, not an array
    const invModelName = data.inv_model
    
    //Display page
    res.render("./inventory/invDetailsView", {
        title: `${invYearName} ${invMakeName} ${invModelName}`,
        nav,
        page,
        reviews,
        inv_id
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
    //Retrieves and stores the navigation bar for use in the view
    let nav = await utilities.getNav()
    
    //Create a select list of the classifications for the inventory management view (same dropdown from add inventory)
    const classificationSelect = await utilities.buildClassificationList()

    //Render data object to be passed to the view
    res.render("inventory/management", {
        title: "Vehicle Management",
        nav,
        classificationSelect,
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
    let classificationList = await utilities.buildClassificationList()
    res.render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        errors: null
    })
}

/* ***************************
 *  Deliver Modify Inventory View
 * ************************** */
invCont.buildModifyInventory = async function (req, res, next) {
    let nav = await utilities.getNav()
    //Collects and stores inventory_id from URL
    const inventory_id = parseInt(req.params.inventory_id)

    //Pull data from database for inventory item
    const data = await invModel.getInventoryByInventoryId(inventory_id)    

    //Set variables for title
    const invTitle = `${data.inv_year} ${data.inv_make} ${data.inv_model}`

    //Dropdown menu
    let classificationList = await utilities.buildClassificationList(data.classification_id) //Added parameter to make dropdown sticky

    //Render Page
    res.render("inventory/modify-inventory", {
        title: invTitle,
        nav,
        classificationList: classificationList,
        errors: null,
        inv_id: data.inv_id,
        inv_make: data.inv_make,
        inv_model: data.inv_model,
        inv_year: data.inv_year,
        inv_description: data.inv_description,
        inv_image: data.inv_image,
        inv_thumbnail: data.inv_thumbnail,
        inv_price: data.inv_price,
        inv_miles: data.inv_miles,
        inv_color: data.inv_color,
        classification_id: data.classification_id
    })
}

/* ***************************
 *  Deliver Delete Inventory View
 * ************************** */
invCont.buildDeleteInventory = async function (req, res, next) {
    let nav = await utilities.getNav()
    //Collects and stores inventory_id from URL
    const inventory_id = parseInt(req.params.inventory_id)

    //Pull data from database for inventory item
    const data = await invModel.getInventoryByInventoryId(inventory_id)    

    //Set variables for title
    const invTitle = `${data.inv_year} ${data.inv_make} ${data.inv_model}`

    //Render Page
    res.render("inventory/delete-inventory", {
        title: invTitle,
        nav,        
        errors: null,
        inv_id: data.inv_id,
        inv_make: data.inv_make,
        inv_model: data.inv_model,
        inv_year: data.inv_year,
        inv_price: data.inv_price,        
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
        //Returns to add classification view and sends error 501 (not successful) code
        res.status(501).render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: null,
        })
    }
}

/* *******
 *Add New Inventory
 * ******* */
invCont.addInventory = async function (req, res) {
    //Retrieves and stores the navigation bar for use in the view
    let nav = await utilities.getNav()

    //Retrieves and stores classification list to be used in the dropdown menu
    let classificationList = await utilities.buildClassificationList()

    //Collects and stores the values from HTML form that are being sent from the browser in the body of the request object
    const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body

    //Calls the function from the model
    const regResult = await invModel.addNewInventory(
        classification_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color
    )

    //Determines if the result was received
    if (regResult) {
        //Set flash message to be displayed
        req.flash(
        "notice",
        `Congratulations, you\'ve added ${inv_year} ${inv_make} ${inv_model} to the inventory.`
        )
        //Takes user back to vehicle management page
        res.status(201).render("inventory/management", {
        title: "Vehicle Management",
        nav,
        errors: null,
        })
    } else {
        //Set flash message to be displayed
        req.flash("notice", "New inventory not added. Please try again.")
        //Returns to add inventory view and sends error 501 (not successful) code
        res.status(501).render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        errors: null,
        })
    }
}


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
    //Collects and stores classification_id from URL
    const classification_id = parseInt(req.params.classification_id)
   //Calls the model-based function to get the data based on classification_id
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    //Check if data present
    if (invData[0].inv_id) {
        //Return data as a JSON object
        return res.json(invData)
    } else {
        next(new Error("No data returned"))
    }
}


/* *******
 *Modify Inventory
 * ******* */
invCont.modifyInventory = async function (req, res, next) {
    //Retrieves and stores the navigation bar for use in the view
    let nav = await utilities.getNav()

    //Collects and stores the values from HTML form that are being sent from the browser in the body of the request object
    const {
        inv_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id,
    } = req.body

    //Calls the function from the model
    const updateResult = await invModel.modifyInventory(
        inv_id,  
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id
    )

    //Determines if the result was received
    if (updateResult) {
        //Sets title name
        const itemName = `${inv_year} ${inv_make} ${inv_model}`
        //Displays message
        req.flash("notice", `The ${itemName} was successfully updated.`)
        //Redirects to default inventory page
        res.redirect("/inv/management")
    } else {
        //Builds dropdown menu with sticky classification_name
        const classificationList = await utilities.buildClassificationList(classification_id)
        //Sets title
        const itemName = `${inv_year} ${inv_make} ${inv_model}`
        //Displays message
        req.flash("notice", "Sorry, the modification failed.")
        //Reloads modify inventory page 
        res.status(501).render("inventory/modify-inventory", {
            title: itemName,
            nav,
            classificationList: classificationList,
            errors: null,
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
            classification_id
        })
    }
}

/* *******
 *Delete Inventory
 * ******* */
invCont.deleteInventory = async function (req, res, next) {
    //Retrieves and stores the navigation bar for use in the view
    let nav = await utilities.getNav()

    //Collects and stores the values from HTML form that are being sent from the browser in the body of the request object
    const {
        inv_id,
        inv_make,
        inv_model,        
        inv_price,
        inv_year,       
    } = req.body

    //Set title name
    const titleName = ` ${inv_year} ${inv_make} ${inv_model}`

    //Calls the function from the model
    const deleteResult = await invModel.deleteInventory(inv_id) //only need the inv_id to delete the row, will be either 0 (failure) or 1 (success)

    //Determines if the data was deleted
    if (deleteResult === 1) { //Changed since we're not just checking if it exists, we want to know if the data was deleted
        //Displays message
        req.flash("notice", `The ${titleName} was successfully deleted.`)
        //Redirects to default inventory page
        res.redirect("/inv/management")
    } else {
        //Displays message
        req.flash("notice", "Sorry, the deletion failed.")
        //Reloads delete inventory page 
        res.status(501).render("inventory/delete-inventory", {
            title: titleName,
            nav,            
            errors: null,
            inv_id,
            inv_make,
            inv_model,
            inv_year,           
            inv_price            
        })
    }
}

 //Export Functions
module.exports = invCont