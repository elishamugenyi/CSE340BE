/*
Model is where all data interactions are stored. 
Here we shall write all our functions to interact
with the tables in the database 
*/

const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, hashedPassword){
    try {
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
      return await pool.query(sql, [account_firstname, account_lastname, account_email, hashedPassword])
    } catch (error) {
      return error.message
    }
  }
  
/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
* Return account data using account_id
* ***************************** */
async function getAccountById(account_id) {
  try {
    const result = await pool.query('SELECT * FROM account WHERE account_id = $1', [account_id]);
    return result;
  } catch (error) {
    console.error('Error fetching account by ID: ', error);
  }
}

/* *****************************
* Update account information 
* ***************************** */
async function updateAccountInfo(account_id, firstname, lastname, email) {
  try {
    const result = await pool.query(
      'UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4',
      [firstname, lastname, email, account_id]
    );
    return result;
  } catch (error) {
    console.error('Error updating account info: ', error);
  }
}

/* *****************************
* Update password  
* ***************************** */
async function updateAccountPassword(account_id, hashedPassword) {
  try {
    const result = await pool.query(
      'UPDATE account SET account_password = $1 WHERE account_id = $2',
      [hashedPassword, account_id]
    );
    return result;
  } catch (error) {
    console.error('Error updating password: ', error);
  }
}


module.exports = {
  registerAccount, 
  getAccountByEmail, 
  getAccountById, 
  updateAccountInfo, 
  updateAccountPassword }