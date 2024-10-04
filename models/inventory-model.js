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



module.exports = {getClassifications, getInventoryByClassificationId, getVehicleById};