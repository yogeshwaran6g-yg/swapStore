import mysql from 'mysql2/promise';
async function listDbs() {
    const connection = await mysql.createConnection({ host: '127.0.0.1', user: 'root', password: '' });
    const [rows] = await connection.query('SHOW DATABASES');
    console.log(rows);
    process.exit(0);
}
listDbs();
