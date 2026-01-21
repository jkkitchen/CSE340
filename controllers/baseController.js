const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function (req, res) {
    const nav = await utilities.getNav()
    res.render("index", {title: "Home", nav})
}

module.exports = baseController //This works the same as the functions being listed in {}