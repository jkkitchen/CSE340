// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation")

//Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

//Route to build inventory item detail view
router.get("/detail/:inventoryId", invController.buildByInventoryId); //used detail instead of type because it's for one specific car, not a category

//Route to build page with links to add classification name and inventory
router.get("/management", utilities.handleErrors(invController.buildManagement))

//Route to build add new classification form page
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))

//Process add classification form inputs
router.post(
    "/add-classification",
    invValidate.addClassificationRules(),
    utilities.handleErrors(invValidate.checkClassificationName),
    utilities.handleErrors(invController.addClassification)
)

//Route to build add new inventory form page
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))

//Process add inventory form inputs
router.post(
    "/add-inventory",
    invValidate.addInventoryRules(),
    utilities.handleErrors(invValidate.checkInventoryInputs),
    utilities.handleErrors(invController.addInventory)
)

//Error Route
router.get("/broken", utilities.handleErrors(invController.throwError))


//Export Route Functions
module.exports = router;