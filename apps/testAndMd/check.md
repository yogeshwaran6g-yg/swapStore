pre setup setup(db,env)


client
VITE_REOWN_PROJECT_ID=be6c4bb8f355023de996ba6748be22e2
VITE_API_URL=http://localhost:4000


server
PORT=4000
NODE_ENV=development
DB_HOST=18.60.186.121
DB_NAME=swapstore
DB_USER=swapStore
DB_PASSWORD=aP2H8fXRLtZc2hLP
DB_PORT=3306




wallet connect no issue check
wallet login
swap form check
db rates check
authcontext (auto dissconet when no token ,after login get profile check) 
protected routes check

seed file check if not mean add


<!-- 6a29505b-bac0-83e8-91a1-ab9dd41d35d2 -->

I've created a markdown artifact containing the SQL bypass queries you requested for testing loan interest collection and repayment.

You can view the document here: 
loan_testing_queries.md

This file includes commands to:

Find a specific user's loan_uid
Backdate next_debit_date to trigger interest collection.
Backdate maturity_date to test auto-close and principal repayment.
Manually force a loan into an overdue state (to test grace periods).
Reset loans back to "active" state so you can test them multiple times.
You can run these queries directly against your local database to bypass the typical wait times required by the cron jobs. Let me know if you need any adjustments to these queries!



Loan Testing Bypass Queries
Use these SQL queries directly in your database (e.g., via phpMyAdmin, DBeaver, or MySQL CLI) to manipulate loan dates and states to test the cron jobs, interest collection, and auto-repayment features.

1. Find a User and Loan to Test
First, get the HEX representation of a user's UID and loan UID to target your queries.

sql

-- List all active/approved loans with readable UIDs
SELECT 
    HEX(uid) AS loan_uid, 
    HEX(user_uid) AS user_uid, 
    status, 
    principal_amount, 
    next_debit_date, 
    maturity_date
FROM loans
WHERE status IN ('approved', 'active');
2. Test Interest Collection (Cron)
The interest collection cron job looks for loans where next_debit_date is in the past. To trigger it manually for a specific loan, bypass the waiting period by backdating this field.

sql

-- Backdate the next debit date by 1 day to force interest collection
UPDATE loans 
SET next_debit_date = DATE_SUB(NOW(), INTERVAL 1 DAY)
WHERE uid = UNHEX('YOUR_LOAN_UID_HERE');
-- Or, update ALL active loans to be eligible for interest collection today
UPDATE loans 
SET next_debit_date = DATE_SUB(NOW(), INTERVAL 1 DAY)
WHERE status IN ('approved', 'active');
3. Test Auto-Close & Repayment at Maturity
If auto-close is enabled in settings, the cron job will attempt to close the loan and collect the principal if the maturity_date has passed.

sql

-- Backdate the maturity date by 1 day to force the loan to mature
UPDATE loans 
SET maturity_date = DATE_SUB(NOW(), INTERVAL 1 DAY)
WHERE uid = UNHEX('YOUR_LOAN_UID_HERE');
4. Test Overdue/Grace Period Logic
If interest collection fails and the loan is past its grace period (default 3 days), it gets marked as overdue.

sql

-- Backdate the next debit date by 5 days (exceeding the 3-day grace period)
-- If the user has insufficient funds, the cron job will flag them as overdue
UPDATE loans 
SET next_debit_date = DATE_SUB(NOW(), INTERVAL 5 DAY)
WHERE uid = UNHEX('YOUR_LOAN_UID_HERE');
5. Reset a Loan for Re-Testing
If a loan was marked completed or overdue, you can manually reset its status to test again.

sql

-- Reset loan status to 'active' and push dates into the future
UPDATE loans 
SET 
    status = 'active', 
    is_overdue = 0, 
    overdue_since = NULL,
    next_debit_date = DATE_ADD(NOW(), INTERVAL 30 DAY),
    maturity_date = DATE_ADD(NOW(), INTERVAL 90 DAY)
WHERE uid = UNHEX('YOUR_LOAN_UID_HERE');
6. View Ledger Entries (Verify Interest Was Collected)
After running the cron job, check the ledger to verify that the interest was successfully collected.

sql

-- View recent interest ledger entries
SELECT 
    HEX(loan_uid) AS loan_uid, 
    interest_amount, 
    collection_status, 
    tx_hash, 
    created_at 
FROM loan_interest_ledger
ORDER BY created_at DESC 
LIMIT 10;