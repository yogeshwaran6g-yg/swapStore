import mysql from 'mysql2/promise';

async function check() {
  const pool = mysql.createPool({
    host: '18.60.186.121',
    user: 'swapStore',
    database: 'swapstore',
    password: 'aP2H8fXRLtZc2hLP',
    port: 3306
  });
  
  const tables = [
    'admins', 'exchange_rates', 'loan_cron_runs', 'loan_interest_ledger',
    'loan_principal_payments', 'loans', 'swap_orders', 'system_settings',
    'user_bank_accounts', 'user_kyc_documents', 'users'
  ];
  
  for(let table of tables) {
    const [rows] = await pool.query(`SELECT count(*) as c FROM ${table}`);
    console.log(`${table}: ${rows[0].c}`);
  }
  process.exit(0);
}
check();
