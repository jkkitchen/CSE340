const invModel = require("../models/inventory-model")
const Util = {}

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
        <option value=''>Choose a Classification</option>`
    data.rows.forEach((row) => {
        classificationList += `<option value="${row.classification_id}"`
        //Use if statement to replace id's with names
        if (classification_id != null && row.classification_id == classification_id) {
            classificationList += ` selected `
        } 
        classificationList += `> ${ row.classification_name }</option >`        
    })
    classificationList += `</select>`

    return classificationList
}


module.exports = Util