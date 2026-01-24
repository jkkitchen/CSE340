// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")

//Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

//Route to build inventory item detail view
router.get("/detail/:inventoryId", invController.buildByInventoryId); //used detail instead of type because it's for one specific car, not a category

//Error Route
router.get("/broken", utilities.handleErrors(invController.throwError))


//Export Route Functions
module.exports = router;