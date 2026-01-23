const pool = require("../database/") //Will pull index.js from the database folder, b/c index is the default we don't need to write it

/* ******* 
 *Get all classification data
 * ***** */
async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")    
}

/* *******
 *Get all inventory items and classification_name by classification_id
* ******* */
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i
            JOIN public.classification AS c
            ON i.classification_id = c.classification_id
            WHERE i.classification_id = $1`, //$1 is a placeholder which will be replace dby the value in the [] below
            [classification_id]
        )
        return data.rows
    } catch (error) {
        console.error("getclassificationsbyid error " + error)
        throw error //Added this so errors will be caught when the SQL query doesn't work
     }
}
 

/* *******
 *Get all data for a specific inventory item
* ******* */
async function getInventoryByInventoryId(inventory_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory
            WHERE inv_id = $1`,
            [inventory_id]
        )
        return data.rows[0] //Because only expecting one row, not an array
    } catch (error) {
        console.error("getInventoryByInventoryId error " + error)
        throw error
    }
}

module.exports = { getClassifications, getInventoryByClassificationId, getInventoryByInventoryId }