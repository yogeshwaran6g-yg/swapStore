import mysql from 'mysql2/promise';

async function killLocks() {
    const connection = await mysql.createConnection({ host: '127.0.0.1', user: 'root', password: '' });
    const [rows] = await connection.query('SHOW PROCESSLIST');
    for (const row of rows) {
        if (row.Id !== connection.threadId && row.User !== 'system user') {
            console.log(`Killing thread ${row.Id} (${row.Command})`);
            await connection.query(`KILL ${row.Id}`);
        }
    }
    console.log('All other connections killed.');
    
    // Now drop and recreate database
    await connection.query('DROP DATABASE IF EXISTS \`swapstore-p\`');
    await connection.query('CREATE DATABASE \`swapstore-p\`');
    console.log('Database swapstore-p recreated.');
    
    process.exit(0);
}

killLocks();
