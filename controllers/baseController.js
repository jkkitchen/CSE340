const utilities = require("../utilities/")
const baseController = {}

//Build nav menu for home page
baseController.buildHome = async function (req, res) {
    //Call nav function from utilities js
    const nav = await utilities.getNav()

    //Create message to be displayed on the home page underneath <h1>
    //The first parameter is the "type" of message and is added as a class to the second parameter, which is the actual message (added as an unordered list).
    // req.flash("notice", "This is a flash message.") //Just for testing.

    //Render home page
    res.render("index", {title: "Home", nav})
}

//Trigger a 500 Server Error--see link in footer.ejs
baseController.triggerError = async function (req, res, next) {
    throw new Error("500 Server Error")
}

module.exports = baseController //This works the same as the functions being listed in {}