const { validationResult } = require("express-validator")//this will validate data
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
/* ************************
 * Build Inventory Management View
 ************************** */
invCont.buildManagement = async function(req, res, next) {
  let nav = await utilities.getNav()
  res.render('inventory/management', {
    title: 'Inventory Management',
    nav,
    messages: req.flash('info'), // Flash messages
  })
}
/* ************************
 * Render Add Classification View
 ************************** */
invCont.buildAddClassification = async function(req, res, next) {
  let nav = await utilities.getNav()
  res.render('inventory/add-classification', {
    title: 'Add New Classification',
    nav,
    errors: null,
    messages: req.flash("info")
  })
}
/* ************************
 * Add New Classification to Database
 ************************** */
invCont.addClassification = async function(req, res, next) {
  const { classification_name } = req.body
  const errors = validationResult(req) // Server-side validation results

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render('inventory/add-classification', {
      title: 'Add New Classification',
      nav,
      errors: errors.array(),
      messages: null
    })
  }

  try {
    const addResult = await invModel.addClassification(classification_name)

    if (addResult) {
      req.flash('info', 'Classification added successfully.')
      let nav = await utilities.getNav()
      return res.render('inventory/management', {
        title: 'Inventory Management',
        nav,
        messages: req.flash('info')
      })
    }
  } catch (error) {
    next(error)
  }
}
/* ************************
 * Render Add Inventory View
 ************************** */
/*invCont.buildAddInventory = async function(req, res, next) {
  let nav = await utilities.getNav()
  res.render('inventory/add-inventory', {
    title: 'Add New Inventory Item',
    nav,
    errors: null
  })
}*/
/* ************************
 * Render Add Inventory View
 ************************** */
invCont.buildAddInventory = async function(req, res, next) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()  // Generate classification drop-down
  let messages = req.flash('info')
  res.render('inventory/add-inventory', {
    title: 'Add New Inventory Item',
    nav,
    classificationList,  // Pass the select list
    errors: null,
    messages,  // Server-side validation errors, if any
    inv_make: req.body.inv_make || '',  // Sticky input handling
    inv_model: req.body.inv_model || '',
    inv_year: req.body.inv_year || '',
    inv_description: req.body.inv_description || '',
    inv_image: req.body.inv_image || '',
    inv_thumbnail: req.body.inv_thumbnail || '',
    inv_price: req.body.inv_price || '',
    inv_miles: req.body.inv_miles || '',
    inv_color: req.body.inv_color || ''
  })
}

/***********
 * Function to handle post for adding inventory
 ***********
 */
 invCont.addInventory = async function(req, res, next) {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
  
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    //console.log("Validation Errors:", errors.mapped())//log to see validation errors
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(classification_id) // Keep sticky inputs for the drop-down
    res.render('inventory/add-inventory', {
      title: 'Add New Inventory Item',
      nav,
      classificationList,
      errors: errors.mapped(),
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    })
    return
  }

  // Insert the new inventory item into the database
  try {
    const newItem = await invModel.addInventory({
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

    req.flash('info', 'New inventory item added successfully!')
    res.redirect('/inv')
  } catch (error) {
    next(error)
  }
}

module.exports = invCont
