const pool = require("../database/") //Will pull index.js from the database folder, b/c index is the default we don't need to write it

/* ******* 
 *Get all classification data
 * ***** */
async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")    
}

module.exports = { getClassifications }