const invModel = require("../models/inventory-model")
const Util = {}

// Error-handling middleware
Util.handleErrors = function (fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next)
  }
}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul class='nav-list'>" //Add class to unordered list
  list += '<li class ="nav-item" ><a href="/" class="nav-link" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li class='nav-item'>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" class="nav-link" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display" class="grid">'
    data.forEach(vehicle => { 
      grid += '<li class="grid-item">'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" class="grid-link" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" class="grid-image" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" class="grid-title" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span class="grid-price">$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the vehicle detail view HTML - 04/OCT
* ************************************ */
Util.buildVehicleHTML = (vehicleData) => {
  return `
    <div class="vehicle-detail">
      <h2>${vehicleData.inv_make} ${vehicleData.inv_model} (${vehicleData.inv_year})</h2>
      <div class="vehicle-content">
        <img src="${vehicleData.inv_image}" alt="${vehicleData.inv_make} ${vehicleData.inv_model}">
        <div class="vehicle-info">
          <p><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(vehicleData.inv_price.toLocaleString())}</p>
          <p><strong>Mileage:</strong> ${vehicleData.inv_miles.toLocaleString()} miles</p>
          <p><strong>Description:</strong> ${vehicleData.inv_description}</p>
        </div>
      </div>
    </div>
  `
}

/* ************************************
 * Build the classification dropdown list
 * ************************************ */
Util.buildClassificationList = async function(classification_id = null) {
  try {
    let data = await invModel.getClassifications()  // Fetch classifications from the database

    let classificationList = '<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"

    // Loop through the classification rows and create options
    data.rows.forEach((row) => {
      classificationList += `<option value="${row.classification_id}"`
      if (classification_id && row.classification_id == classification_id) {
        classificationList += " selected"
      }
      classificationList += `>${row.classification_name}</option>`
    })

    classificationList += "</select>"
    return classificationList
  } catch (error) {
    console.error("Error building classification list:", error)
    return `<p class="error">Unable to load classifications.</p>`
  }
}

module.exports = Util

//module.exports = { buildVehicleHTML }

/**
 *****************************************
 This code has utilities that we shall use 
 over and over again in our code
 ******************************************
  */