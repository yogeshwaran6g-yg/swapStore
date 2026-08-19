# Loan System — How It All Works

This explains the full loan lifecycle: DB, API, Cron, Listener, and every scenario (success, fail, overdue, etc.)

---

## The 4 Players

| Player | What it does |
|---|---|
| **API** | User/admin actions (request loan, run cron manually) |
| **DB** | Source of truth — 4 loan tables |
| **Cron** | Collects interest periodically (auto midnight or admin manual) |
| **Listener** | Watches the blockchain — confirms on-chain events into DB |

---

## DB Tables (Quick Reference)

```
loans                  → one row per loan
loan_interest_ledger   → one row per interest collection attempt
loan_cron_runs         → one row per cron run (auto or manual)
loan_principal_payments → one row per principal repayment by user
```

---

## 1. Loan Creation

**Who triggers it:** User via client app  
**API:** `POST /api/v1/loan/request`

### What happens step by step:

```
User clicks "Request Loan"
        │
        ▼
API checks KYC → must be 'approved' in users.kyc_status
        │
        ▼
API checks on-chain token balance (e.g. holds ≥50 USDT on BSC)
        │
        ▼
API finds matching tier from system_settings → loan_eligibility_tiers
  Example tier: { min_balance: 50, max_loan: 100, token: "USDT", network: "bsc" }
        │
        ▼
API inserts row into `loans` table

  status         = 'pending'
  principal      = e.g. 100 USDT
  interest_rate  = from system_settings (e.g. 5%)
  next_debit_date = NOW + loan_interest_frequency_days (e.g. 30 days)
  maturity_date  = NOW + loan_default_term_days (e.g. 30 days)
  loan_id        = random bytes32 (used on-chain)
```

### DB state after creation:
```
loans.status = 'pending'
loans.disbursed_at = NULL
loans.disbursement_tx_hash = NULL
```

---

## 2. Loan Disbursement (Admin sends funds on-chain)

**Who triggers it:** Admin from admin panel  
**What happens:** Admin calls `issueLoan()` on the smart contract

```
Admin calls contract.issueLoan(loanId, userWallet, token, principal, fee)
        │
        ▼
Contract pulls funds from loanWallet → sends (principal - fee) to user wallet
Contract sends fee → feeWallet
Contract emits LoanIssued event
        │
        ▼
Listener catches LoanIssued event
        │
        ▼
Listener updates DB:

  loans.status              = 'approved'
  loans.disbursed_at        = NOW
  loans.disbursement_tx_hash = tx hash
  loans.disbursed_amount    = principal - fee
  loans.disbursement_fee    = fee
  loans.next_debit_date     = NOW + frequency_days
  loans.maturity_date       = NOW + term_days
```

### DB state after disbursement:
```
loans.status = 'approved'
loans.disbursement_tx_hash = '0xabc...'
loans.next_debit_date = <30 days from now>
```

---

## 3. Interest Collection — Normal (Cron runs, user has balance + allowance)

**Who triggers it:** Cron job (auto at midnight OR admin manual from admin panel)  
**API (manual):** `POST /api/v1/loan/admin/run-interest-collection`

### The cron query — which loans get picked:
```sql
SELECT * FROM loans
JOIN users ON loans.user_uid = users.uid
WHERE status IN ('approved', 'active')
  AND next_debit_date <= NOW()
```

**If next_debit_date is in the future → loan is SKIPPED. Nothing happens.**

### What happens when a loan IS picked:

```
Cron picks loan
        │
        ▼
Creates loan_cron_runs row  (run_status = 'running')
        │
        ▼
Calculates interest = principal_amount × interest_rate / 100
  e.g. $100 × 5% = $5
        │
        ▼
Inserts into loan_interest_ledger:
  collection_status = 'collecting'
  interest_amount   = 5
  tx_hash           = NULL (not yet)
        │
        ▼
Calls contract.collectPayment(loanId, userWallet, token, $5 in wei)
        │
        ▼
Contract pulls $5 USDT from user wallet → interestWallet
Contract emits PaymentCollected event
        │
        ▼
loanService immediately:
  loans.next_debit_date = NOW + 30 days   ← so cron doesn't re-queue it
        │
        ▼
Listener catches PaymentCollected event:
  loan_interest_ledger.collection_status = 'collected'
  loan_interest_ledger.tx_hash           = '0xabc...'
  loan_interest_ledger.collected_at      = NOW
  loans.total_interest_paid             += $5
        │
        ▼
Cron updates loan_cron_runs:
  run_status              = 'completed'
  total_loans_processed   = 1
  successful_collections  = 1
  total_interest_collected = 5
```

### DB state after successful collection:
```
loans.next_debit_date     = <30 days from now>
loans.total_interest_paid = 5.00
loan_interest_ledger.collection_status = 'collected'
loan_interest_ledger.tx_hash = '0xabc...'
loan_cron_runs.run_status = 'completed'
loan_cron_runs.successful_collections = 1
```

---

## 4. Interest Collection — FAILED (user has no balance or no allowance)

Same flow as above until the contract call:

```
contract.collectPayment() REVERTS
  Reason: "User allowance low" or "User balance low"
        │
        ▼
loanService catches the error:
  loan_interest_ledger.collection_status = 'failed'
  loan_interest_ledger.failure_reason    = 'User allowance low'
  loans.next_debit_date is NOT advanced  ← stays in the past
        │
        ▼
Cron checks grace period (system_settings: loan_grace_period_days, default 3 days)

  If days past due > grace period:
    loans.status     = 'overdue'
    loans.is_overdue = 1
    loans.overdue_since = NOW
    loans.overdue_count += 1
    loan_cron_runs.overdue_flagged += 1
  Else:
    stays as 'approved' / 'active', will retry next cron run
        │
        ▼
Cron updates loan_cron_runs:
  run_status         = 'failed' (if all failed) or 'partial' (some ok, some failed)
  failed_collections += 1
```

### DB state after failed collection:
```
loans.next_debit_date   = still in the past (retries on next cron)
loans.is_overdue        = 1 (if past grace period)
loans.status            = 'overdue' (if past grace period)
loan_interest_ledger.collection_status = 'failed'
loan_interest_ledger.failure_reason    = 'User allowance low'
loan_cron_runs.run_status = 'failed'
```

---

## 5. No Loans Due (Cron runs but nothing to collect)

```
Cron runs
        │
        ▼
Query returns 0 loans (all next_debit_date > NOW)
        │
        ▼
Logs: "No loans require interest collection this run."
        │
        ▼
loan_cron_runs row created and immediately closed:
  run_status            = 'completed'
  total_loans_processed = 0
```

**This is the most common cause of confusion.** If you hit "Run Cron" and see 0 processed — check
`loans.next_debit_date`. If it's in the future, nothing will run.

To force it for testing:
```
node test-cron-ready.js backdate           → all loans
node test-cron-ready.js backdate <loanUid> → one specific loan
```

---

## 6. Loan Matures (maturity_date reached)

If `loan_auto_close_on_maturity = 1` in system_settings:

```
Cron picks up the loan (next_debit_date past)
        │
        ▼
checkAndAutoCloseLoan() checks: NOW >= maturity_date?
        │
        ├── YES → loans.status = 'closed', loans.closed_at = NOW
        │         skips interest collection for this loan
        │
        └── NO  → proceeds with interest collection normally
```

### DB state after auto-close:
```
loans.status    = 'closed'
loans.closed_at = <timestamp>
```

---

## 7. Principal Repayment (User pays back loan)

**Who triggers it:** User via client app  
**What happens:** User calls `repayPrincipal()` on the smart contract directly

```
User calls contract.repayPrincipal(loanId, token, amount)
        │
        ▼
Contract pulls amount from user wallet → loanWallet
Contract emits PrincipalRepaid event
        │
        ▼
Listener catches PrincipalRepaid event:
  loans.total_principal_paid   += amount
  loans.outstanding_principal  -= amount (min 0)
```

### DB state after repayment:
```
loans.outstanding_principal  = reduced
loans.total_principal_paid   = increased
```

---

## 8. ADMIN_PRIVATE_KEY Not Set (Simulated Mode)

If `ADMIN_PRIVATE_KEY` is blank in `.env`, no real on-chain tx happens:

```
No contract call is made
        │
        ▼
loanService records interest as if it was collected:
  loan_interest_ledger.collection_status = 'collected'
  loan_interest_ledger.tx_hash           = NULL
  loans.total_interest_paid             += interest
  loans.next_debit_date                  = NOW + 30 days

Logs: "On-chain collection not configured — recording as simulated."
```

**The listener never fires** because there was no real tx. The DB is updated directly.

---

## 9. Cron Run Types

| run_type | Who | Target |
|---|---|---|
| `auto_scheduled` | Midnight cron (automatic) | All due loans |
| `admin_all` | Admin → "Run All" button | All due loans |
| `admin_specific` | Admin → target one user | Due loans for that user only |

---

## Flow Summary Diagram

```
User requests loan
      │
      ▼
loans table: status = 'pending'
      │
      ▼ (admin issues on-chain)
LoanIssued event → Listener → status = 'approved', next_debit_date set
      │
      ▼ (30 days later, cron runs)
next_debit_date <= NOW ?
      │
      ├── NO  → skip, log "no loans due"
      │
      └── YES → collectPayment on-chain
                    │
                    ├── SUCCESS → PaymentCollected event
                    │             Listener: ledger = 'collected', tx_hash saved
                    │             loanService: next_debit_date += 30 days
                    │
                    └── FAIL   → ledger = 'failed', failure_reason saved
                                 if past grace period → status = 'overdue'
                                 next_debit_date stays in past → retries next run
```

---

## Key Things That Catch People Out

1. **Cron runs but processes 0 loans** → `next_debit_date` is still in the future. Use `node test-cron-ready.js backdate` to fix for testing.

2. **Simulated run advances next_debit_date** → If `ADMIN_PRIVATE_KEY` wasn't set, the simulated run already moved `next_debit_date` forward. A real run won't pick it up until that future date. Reset with `node test-cron-ready.js reset` then backdate again.

3. **total_interest_paid doubles** → Was a bug (now fixed). The listener is the single source of truth for `total_interest_paid`. The loanService only advances `next_debit_date` after submitting the tx.

4. **Listener updates `total_interest_paid` with wei value** → Was a bug (now fixed). The listener now converts `amount / 1e18` before writing to DB.

5. **next_debit_date past maturity_date** → Happens when a simulated run pushes the date beyond `maturity_date`. The cron will auto-close the loan instead of collecting interest.

---

## Useful Admin API Endpoints

| Endpoint | What it does |
|---|---|
| `GET /api/v1/loan/admin/loans-users` | All loans with user info |
| `POST /api/v1/loan/admin/run-interest-collection` | Manual cron trigger |
| `GET /api/v1/loan/admin/cron-history` | All cron run records |
| `GET /api/v1/loan/admin/settings` | System settings (rates, tiers, etc.) |

---

## Test Helper Scripts

```bash
# Show all loans and their status
node test-cron-ready.js

# Make all active loans due NOW (so next cron run collects them)
node test-cron-ready.js backdate

# Make one specific loan due NOW
node test-cron-ready.js backdate <loanUid>

# Reset next_debit_date to 30 days out (undo backdate)
node test-cron-ready.js reset

# Check all table row counts
node test-db.js
```
