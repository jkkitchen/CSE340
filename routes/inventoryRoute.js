// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")

//Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

//Route to build inventory item detail view
router.get("/detail/:inventoryId", invController.buildByInventoryId); //used detail instead of type because it's for one specific car, not a category

module.exports = router;