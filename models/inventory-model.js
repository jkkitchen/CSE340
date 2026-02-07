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
            WHERE i.classification_id = $1`, //$1 is a placeholder which will be replaced by the value in the [] below
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

/* *******
 *Add new classification name to database
* ******* */
async function addNewClassificationName(classification_name) {
    try {
        const data = await pool.query(
            `INSERT INTO public.classification (classification_name)
            VALUES ($1)
            RETURNING classification_name`, //only returns the row that was just inserted
            [classification_name]
        )
        return data.rows[0] //To check the new row was inserted
    } catch (error) {
        console.error("addNewClassificationName error " + error)
        throw error
    }
}

/* *******
 *Add new inventory to database
* ******* */
async function addNewInventory(
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
) {
    try {
        const data = await pool.query(
            `INSERT INTO public.inventory (classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *`, //only returns the row that was just inserted
            [classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color]
        )
        return data.rows[0] //To check the new row was inserted
    } catch (error) {
        console.error("addNewInventory error " + error)
        throw error
    }
}

/* *******
 *Add modified inventory to database
* ******* */
async function modifyInventory(    
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
    ) {
    try {
        const sql =
            `UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, 
            inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *`
        const data = await pool.query(sql, [
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id,
        inv_id
        ])
        return data.rows[0]
    } catch (error) {
        console.error("model error: " + error)
    }
}

async function deleteInventory(inv_id) {
    try {
        const sql =
            `DELETE FROM public.inventory 
            WHERE inv_id = $1`
        const result = await pool.query(sql, [inv_id])
        return result.rowCount //Using rowcount because the object will exist whether or not it was deleted, this way we can check if it was deleted (0 = failure, 1 = success)
    } catch (error) {
        console.error("model error: " + error)
        throw new Error("Delete Inventory Error") //added throw so it wil not silently fail
    }
}

module.exports = {
    getClassifications,
    getInventoryByClassificationId,
    getInventoryByInventoryId,
    addNewClassificationName,
    addNewInventory,
    modifyInventory,
    deleteInventory
}