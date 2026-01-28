const pool = require("../database/") //Will pull index.js from the database folder, b/c index is the default we don't need to write it

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
      //The $1, $2, $3, $4 refer to the parameters of the function
      //The RETURNING * indicates to the PostgrSQL server to return values based on the record that was inserted to confirm the insertion worked
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}


//Export the functions
module.exports = { registerAccount }