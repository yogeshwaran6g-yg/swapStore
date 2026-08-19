import mysql from 'mysql2/promise';

async function testWamp() {
    try {
        const connection = await mysql.createConnection({ host: '127.0.0.1', user: 'root', password: '', port: 3307 });
        const [rows] = await connection.query('SHOW DATABASES');
        console.log("Connected to WampServer MariaDB (3307):");
        console.log(rows);
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}

testWamp();
