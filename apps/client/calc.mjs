import { toFunctionSelector } from 'viem';
const errors = ['Reentrant()','NotOwner()','NotAdmin()','NotPendingOwner()','InvalidAddress()','TokenNotAccepted()','AlreadyAccepted()','NotAccepted()','EmptyTokenList()','InvalidAmount()','DuplicateOrder()','DuplicateLoan()','ContractPaused()','NotPaused()','TransferFailed()','InsufficientBalance()','InsufficientAllowance()'];
errors.forEach(e => console.log(e, toFunctionSelector(e)));
