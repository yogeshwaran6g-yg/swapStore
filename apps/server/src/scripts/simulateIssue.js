import { createPublicClient, http, parseAbiItem, parseUnits } from 'viem';
import { bsc } from 'viem/chains';

async function main() {
  const transport = http('https://bsc-dataseed.binance.org/');
  const publicClient = createPublicClient({ chain: bsc, transport });
  
  const LOAN_CONTRACT = '0xfaa09C346475BaB145151d5DAF2c4f452Dc66a59';
  const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
  
  // Try to simulate with principal=0.0000001, fee=0
  const principalWei = parseUnits("0.0000001", 18);
  const feeWei = parseUnits("0", 18);
  const loanId = "0x" + "1".repeat(64);
  const user = "0x457DDBAa72ACa0DD4d8be98Fa3f4F3c3b98bbC11"; // random user

  try {
    console.log(`Simulating issueLoan with principal=${principalWei}, fee=${feeWei}`);
    await publicClient.simulateContract({
      address: LOAN_CONTRACT,
      abi: [{
        name: 'issueLoan',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'loanId',    type: 'bytes32' },
          { name: 'user',      type: 'address' },
          { name: 'token',     type: 'address' },
          { name: 'principal', type: 'uint256' },
          { name: 'fee',       type: 'uint256' },
        ],
        outputs: [],
      }],
      functionName: 'issueLoan',
      args: [loanId, user, USDT_ADDRESS, principalWei, feeWei],
      account: "0x9F334423476237bAa258e234dd36eD0C175AfD66"
    });
    console.log('Simulation success!');
  } catch (e) {
    console.log('Error:', e.message);
  }
}
main();
