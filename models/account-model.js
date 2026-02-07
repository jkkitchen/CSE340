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

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
    try {
        const sql = "SELECT * FROM account WHERE account_email = $1"
        const email = await pool.query(sql, [account_email])
        return email.rowCount //If greater than 0 than the account already exists
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
* Return account data using account id
* ***************************** */
async function getAccountById (account_id) {
    try {
        const result = await pool.query(
        'SELECT account_id, account_firstname, account_lastname, account_email FROM account WHERE account_id = $1',
        [account_id])
        return result.rows[0]
    } catch (error) {
        return new Error("No matching id found")
    }
}


/* *****************************
* Update Account Data for First Name, Last Name, and Email
* ***************************** */
async function updateAccountInfo (account_id, account_firstname, account_lastname, account_email) {
    try {
        const result = await pool.query(
            `UPDATE public.account 
            SET account_firstname = $1, account_lastname = $2, account_email = $3
            WHERE account_id = $4`,
        [account_firstname, account_lastname, account_email, account_id])
        return result.rows[0]
    } catch (error) {
        return new Error("No matching id found")
    }
}


/* *****************************
* Update Account Data for Password
* ***************************** */
async function updatePassword (account_id, account_password) {
    try {
        const result = await pool.query(
            `UPDATE public.account 
            SET account_password = $1
            WHERE account_id = $2`,
        [account_password, account_id])
        return result.rows[0]
    } catch (error) {
        return new Error("No matching id found")
    }
}


//Export the functions
module.exports = {
    registerAccount,
    checkExistingEmail,
    getAccountByEmail,
    getAccountById,
    updateAccountInfo,
    updatePassword
}