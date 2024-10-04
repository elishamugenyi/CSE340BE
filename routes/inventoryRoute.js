//Needed resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")

//Route to build inventory by classification view
router.get("/type/:classificationId",invController.buildByClassificationId);

//add this route that accepts inventory Id as URL. New line - 04/oct
router.get("/detail/:invId", invController.getVehicleDetail)

module.exports = router;