import mysql from 'mysql2/promise';
import env from "./env.js";


const pool = mysql.createPool({
    host: env.dbHost,
    user: env.dbUser,
    database: env.dbName,
    password: env.dbPassword,
    port: env.dbPort
})


export const queryRunner = async function (query, values = []) {
    try {
        const [rows] = await pool.query(query, values)
        return rows?rows:null;

    } catch (err) {
        console.log(err.message)
        return null
    }
}