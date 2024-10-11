/*
Model is where all data interactions are stored. 
Here we shall write all our functions to interact
with the tables in the database 
*/

const pool = require("../database/")

/* ***************************
 *  Define a model func getVehicleById that queries the database
    for a specific vehicle based on the inventory ID -04/october
 * ************************** */
  const getVehicleById = async (invId) => {
    try {
      const result = await pool.query("SELECT * FROM inventory WHERE inv_id = $1", [invId])
      return result.rows[0] // Return the single vehicle data
    } catch (error) {
      console.error("Error getting vehicle by ID:", error)
      throw error
    }
  }

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ************************
 * Add New Classification to Database
 ************************** */
async function addClassification(classification_name) {
  try {
    const sql = 'INSERT INTO classification (classification_name) VALUES ($1) RETURNING *'
    const data = await pool.query(sql, [classification_name])
    return data.rows[0]
  } catch (error) {
    console.error('Error inserting classification:', error)
    throw error
  }
}

/* ****************************
 * Add new inventory item
 **************************** */
async function addInventory(inventoryData) {
  try {
    const sql = `
      INSERT INTO inventory 
        (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING inv_id
    `

    const params = [
      inventoryData.inv_make,
      inventoryData.inv_model,
      inventoryData.inv_year,
      inventoryData.inv_description,
      inventoryData.inv_image,
      inventoryData.inv_thumbnail,
      inventoryData.inv_price,
      inventoryData.inv_miles,
      inventoryData.inv_color,
      inventoryData.classification_id
    ]

    const result = await pool.query(sql, params)

    return result.rows[0].inv_id  // Return the newly inserted inventory item ID
  } catch (error) {
    console.error("Error adding inventory:", error)
    throw error  // Rethrow the error to be caught in the controller
  }
}

module.exports = {getClassifications, getInventoryByClassificationId, getVehicleById, addClassification, addInventory};