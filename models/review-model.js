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
 *Get a review from database using review_id
* ******* */
async function getReviewById(review_id) {
    try {
        const data = await pool.query(           
            `SELECT * FROM public.reviews
            WHERE review_id = $1`,
            [review_id]
        )
        return data.rows[0] //Should only be 1 row of data since review_id is unique
    } catch (error) {
        console.error("getReviewsByReviewId error " + error)
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

/* *******
 *Modify review in database
* ******* */
async function modifyReview(review_id, review_text, account_id) {
    try {
        const sql =
            `UPDATE public.reviews SET review_text = $1 
            WHERE review_id = $2 AND account_id = $3 
            RETURNING *`
        const data = await pool.query(sql, [review_text, review_id, account_id])
        return data.rows[0]
    } catch (error) {
        console.error("model error: " + error)
        throw error
    }
}

/* *******
 *Delete review from database
* ******* */
async function deleteReview(review_id, account_id) {
    try {
        const sql =
            `DELETE FROM public.reviews 
            WHERE review_id = $1 AND account_id = $2`
        const result = await pool.query(sql, [review_id, account_id])
        return result.rowCount //Using rowcount because the object will exist whether or not it was deleted, this way we can check if it was deleted (0 = failure, 1 = success)
    } catch (error) {
        console.error("model error: " + error)
        throw error //added throw so it wil not silently fail
    }
}

module.exports = {
    getReviewsByAccountId,
    getReviewsByInventoryId,
    getReviewById,
    addNewReview,
    modifyReview,
    deleteReview
}