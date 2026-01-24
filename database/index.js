const { Pool } = require("pg")
require("dotenv").config()

//Temporary Code to check for errors:
console.log("NODE_ENV =", process.env.NODE_ENV)
console.log("DATABASE_URL exists?", !!process.env.DATABASE_URL)
console.log("DATABASE_URL =", process.env.DATABASE_URL)


/* ******
 * Connection Pool
 * SSL Object needed for local testing of app
 * But will cause problems in production environment
 * If - else will make determination which to use
 ******* */
let pool 
if (process.env.NODE_ENV == "development") {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    })


//Added for troubleshooting queries during development
    module.exports = {
        async query(text, params) {
            try {
                const res = await pool.query(text, params)
                console.log("executed query", { text })
                return res 
            } catch (error) {
                console.error("error in query", { text })
                throw error
            }
        },
    }
} else {
    pool = new Pool({
        connectionSTring: process.env.DATABASE_URL,
    })
    module.exports = pool
}