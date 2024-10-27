const { validationResult } = require("express-validator")//this will validate data
const invModel = require("../models/inventory-model")
const reviewModel = require("../models/review-model")
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
    const reviews = await reviewModel.getReviewsByItem(invId)
    
    if (vehicleData) {
      // Create HTML content using a utility function
      const vehicleHTML = utilities.buildVehicleHTML(vehicleData)
      
      res.render("inventory/detail", {
        title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
        vehicleHTML,
        reviews, //pass reviews
        nav: await utilities.getNav(),
        user: req.user //pass user if logged in
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
    errors: null,
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
  
  //log form data
  //console.log("Form Data:", req.body)

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
    res.redirect('/inv/management')
  } catch (error) {
    next(error)
  }
}

// Deliver the delete confirmation view
invCont.getDeleteView = async (req, res) => {
  try {
    const nav = await utilities.getNav(); // Build navigation

    res.render('inventory/delete-confirm', {
      title: 'Delete Vehicle',
      nav,
      item: null, // No specific item data is loaded, admin will input details manually
      errors: null,
    });
  } catch (error) {
    console.error('Error rendering delete view:', error);
    res.status(500).send('Server error');
  }
}

// Process the deletion of a vehicle
invCont.deleteInventoryItem = async (req, res, next) => {
  try {
    const { inv_id } = req.body;
    //console.log("inv_id", inv_id) //log inv id from the form if its there.

    // Parse inv_id as an integer
    const parsedInvId = parseInt(inv_id);
    

    //check if inv_id is not undefined or empty
    if (!inv_id) {
      req.flash ("error", "Inventory ID is missing.")
      return res.redirect("/inv/delete-confirm")
    }

    // Validate that inv_id is a number
    if (isNaN(parsedInvId) || parsedInvId <= 0 ) {
      throw new Error('Invalid inventory ID');
    }
  
    // Attempt to delete the vehicle from the database
    const result = await invModel.deleteInventory(parsedInvId);

    if (result.rowCount === 0) {
      req.flash('error', 'Vehicle not found or could not be deleted.');
      return res.redirect('/inv/delete-confirm');
    }

    req.flash('success', `Vehicle with ID ${parsedInvId} successfully deleted.`);
    res.redirect('/inv/management');
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    req.flash('error', 'An error occurred while attempting to delete the vehicle.');
    res.redirect('/inv/delete-confirm');
  }
}


module.exports = invCont
