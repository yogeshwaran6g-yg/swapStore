import mysql from 'mysql2/promise';
import env from "./env.js";


const pool = mysql.createPool({
    host: env.dbHost,
    user: env.dbUser,
    database: env.dbName,
    password: env.dbPassword,
    port: env.dbPort,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

pool.getConnection()
    .then(connection => {
        console.log('✅ Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
    });


export const queryRunner = async function (query, values = []) {
    try {
        const [rows] = await pool.query(query, values)
        return rows ? rows : null;

    } catch (err) {
        console.log(err.message)
        throw err
    }
}