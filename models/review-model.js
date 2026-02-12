const pool = require("../database/") //Will pull index.js from the database folder, b/c index is the default we don't need to write it

/* *******
 *Get all reviews for a specific account (user)
* ******* */
async function getReviewsByAccountId(account_id) {
    try {
        const data = await pool.query(            
            `SELECT r.review_id, r.review_date, i.inv_year, i.inv_make, i.inv_model
            FROM public.reviews r
            JOIN public.inventory i
            ON r.inv_id = i.inv_id
            WHERE r.account_id = $1`, //$1 is a placeholder which will be replaced by the value in the [] below
            [account_id]
        )
        return data.rows
    } catch (error) {
        console.error("getreviewsbyid error " + error)
        throw error //Added this so errors will be caught when the SQL query doesn't work
     }
}
 

/* *******
 *Get all reviews for a specific inventory item
* ******* */
async function getReviewsByInventoryId(inventory_id) {
    try {
        const data = await pool.query(
           //Must JOIN account table to get access to account user names to create alias
            `SELECT r.review_id, r.review_text, r.review_date, CONCAT(LEFT(a.account_firstname,1), a.account_lastname) AS review_alias
            FROM public.reviews r
            JOIN public.account a
            ON r.account_id = a.account_id
            WHERE r.inv_id = $1
            ORDER BY r.review_date DESC`,
            [inventory_id]
        )
        return data.rows
    } catch (error) {
        console.error("getReviewsByInventoryId error " + error)
        throw error
    }
}


/* *******
 *Add new review to database
* ******* */
async function addNewReview(
    review_text,
    inv_id,
    account_id
) {
    try {
        const data = await pool.query(
            `INSERT INTO public.reviews (review_text, inv_id, account_id)
            VALUES ($1, $2, $3)
            RETURNING *`, //only returns the row that was just inserted
            [review_text, inv_id, account_id]
        )
        return data.rows[0] //To check the new row was inserted
    } catch (error) {
        console.error("addNewReview error " + error)
        throw error
    }
}

module.exports = {
    getReviewsByAccountId,
    getReviewsByInventoryId,
    addNewReview
}