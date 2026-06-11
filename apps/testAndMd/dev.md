making balance display 
for the tokens of

BNB POL

USDT
USDC
USDS
DAI
USDE



going with verified tokens only

BNB POL
USDT
USDC
DAI



flow

1.landing page (home)
2.cta( => redirect to form )
3.form data {
    email
    phone *
    account no *
    name *
    ifsc *
}
4.select the token to swap (usdc, usdt, dai)
5.show the inr value fo the selected token
6.connect the wallet (with approve the contrac to withdraw funds every time)



loan feature
1.create a contract with auto depit the intereset 






connect done 


User
   ↓
swap()
   ↓
Smart Contract
   ↓
Event Emitted
   ↓
Backend Indexer
   ↓
Database
   ↓
Admin Dashboard
   ↓
INR Transfer

mapping(uint256 => bool) public processedRequestIds;

require(!processedRequestIds[requestId], "Request exists");
processedRequestIds[requestId] = true;


changes
1.the swap order is ok but the status need to update like user_crypto_payment_status (initited /created, success/completed/paid, failed)
2. the admin payment id add feature and status update like admin_inr_payment_status()
3.befoe update user crypto status check the tx hash that is actual admin wallet 

3.the db stores the token address only wont stores the token symbol and also the for makes multiple submit make that to single update
4.remove etherium from the listner 


We need to add a blockchain confirmation waiting period before marking a crypto deposit as received.

Current Flow:

1. User calls swap().
2. Contract emits SwapRequested event.
3. Backend listener receives event.
4. Database immediately marks order as crypto_received.

Problem:

Receiving an event does not guarantee the transaction is final. Blockchain networks can occasionally experience chain reorganizations (reorgs), where a recently mined block is replaced by another block. In rare situations, a transaction that appeared successful can disappear from the chain.

Example:

* User swaps 100 USDT.
* SwapRequested event is received.
* Backend immediately marks order as crypto_received.
* A chain reorganization occurs.
* The transaction is removed from the blockchain.
* Database now incorrectly shows crypto_received even though no funds were actually transferred.

Recommended Solution:

After receiving the SwapRequested event:

1. Extract the transaction hash.
2. Wait for a minimum number of confirmations.
3. Verify the transaction receipt is successful.
4. Only then update the database status.

Example:

Polygon:

* Wait 5–10 confirmations

BNB Chain:

* Wait 5–10 confirmations

Ethereum:

* Wait 12+ confirmations

Tron:

* Wait 10–20 confirmations

Updated Flow:

User
↓
swap()
↓
SwapRequested Event
↓
Backend Listener
↓
Wait for Confirmations
↓
Verify Transaction Receipt
↓
status = crypto_received
↓
Admin Reviews
↓
Admin Sends INR
↓
status = completed

Important:

crypto_received and completed must be separate statuses.

crypto_received:

* Blockchain deposit confirmed.
* INR has NOT been sent yet.

completed:

* INR transfer has been successfully processed.
* Order is fully settled.

This confirmation waiting period provides additional protection against blockchain reorganizations and prevents the platform from processing deposits that are not yet considered final.
