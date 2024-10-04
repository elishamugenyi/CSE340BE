const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ****************
* set variables for function getVehicleDetail and build vehicle details.- 04/0ct
* ***************** */
const getVehicleDetail = async (req, res, next) => {
  const invId = req.params.invId
  try {
    // Fetch the vehicle data using the invId
    const vehicleData = await invModel.getVehicleById(invId)
    
    if (vehicleData) {
      // Create HTML content using a utility function
      const vehicleHTML = utilities.buildVehicleHTML(vehicleData)
      
      res.render("inventory/detail", {
        title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
        vehicleHTML,
        nav: await utilities.getNav()
      })
    } else {
      next({ status: 404, message: "Vehicle not found" })
    }
  } catch (error) {
    next(error)
  }
}

//Attach getVehicleDetail function to invCont - 04/oct
invCont.getVehicleDetail = getVehicleDetail

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

module.exports = invCont
