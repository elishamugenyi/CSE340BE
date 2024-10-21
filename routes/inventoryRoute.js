//Needed resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const { check } = require("express-validator")
const checkRole = require("../utilities/checkRole")

//Route to build inventory by classification view
router.get("/type/:classificationId",invController.buildByClassificationId);

//add this route that accepts inventory Id as URL. New line - 04/oct
router.get("/detail/:invId", invController.getVehicleDetail)

//Route for inventory management
router.get("/inventory/management", checkRole(['Employee', 'Admin']), invController.buildManagement)

//Route to add a new classsification
router.get("/add-classification", checkRole(['Employee', 'Admin']), invController.buildAddClassification)

//Route to add a new inventory item
router.get("/add-item", checkRole(['Employee', 'Admin']), invController.buildAddInventory)

//route to get delete view
router.get("/delete-confirm", checkRole(['Employee', 'Admin']), invController.getDeleteView)

//route to handle the deletion process
router.post("/inv/delete-confirm", checkRole(['Employee', 'Admin']), invController.deleteInventoryItem)

// Route to handle the form submission with server-side validation
router.post("/add-classification", 
    [
      // Server-side validation
      check("classification_name")
        .isAlpha().withMessage("Classification name must be alpha")
        .not().isEmpty().withMessage("Classification name cannot be empty"),
    ], checkRole(['Employee', 'Admin']),
    invController.addClassification
  )

//Route to handle form submission with server-side validation
router.post ("/add-inventory", checkRole(['Employee', 'Admin']), invController.addInventory)

module.exports = router;