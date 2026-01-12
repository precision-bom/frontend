import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0x6d9Deb320173e202fEEA60092cB29B64615fBb3e";
const VAULT_ADDRESS = "0xd24fD54959A2303407505dC602e94BCdA5F4AcDD";
const SUBSCRIPTION_FEE = "0.001"; // ETH
const FEE_WEI = ethers.parseEther(SUBSCRIPTION_FEE);

const ABI = [
  "function json() external view returns (string memory)",
  "function write(string[] calldata keys, string[] calldata values) external"
];

const CLICKWRAP_MESSAGE = (nonce: string) => `PrecisionBOM Terminal Access & Sourcing Agreement: By signing this cryptographic strike, I acknowledge: 1. Authorization to interact with the PrecisionBOM forensic substrate. 2. Acceptance of the 0.001 ETH (Sepolia) monthly subscription fee. 3. Consent to the recording of all sourcing strikes within ERC-7827. NOTE: If no active substrate record is found for this identity, a transaction request for 0.001 Sepolia ETH will follow to initialize access. Session Nonce: ${nonce}`;

export async function POST(request: Request) {
  try {
    const { address, signature, nonce, txHash } = await request.json();

    if (!address || !signature || !nonce) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Identity Recovery
    const recoveredAddress = ethers.verifyMessage(CLICKWRAP_MESSAGE(nonce), signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json({ error: `Identity mismatch` }, { status: 401 });
    }

    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com");
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    
    // 2. Tier 1: Registry Check
    const jsonStateString = await contract.json();
    const state = JSON.parse(jsonStateString);
    const lowerAddress = address.toLowerCase();
    const expirationDateStr = state[lowerAddress];
    const tokenBalance = state[`${lowerAddress}_tokens`] || "0";
    const now = new Date();

    if (expirationDateStr && new Date(expirationDateStr) > now) {
      return NextResponse.json({ 
        status: '200 OK', 
        message: 'Access Granted: Registry Verified',
        expiration: expirationDateStr,
        tokens: tokenBalance
      });
    }

    // 3. NEW Tier 2: Direct Hash Verification (Fast Path)
    let paymentVerified = false;
    let paymentDate = new Date();

    if (txHash) {
      console.log(`[HASH STRIKE] Verifying transaction: ${txHash}...`);
      try {
        const tx = await provider.getTransaction(txHash);
        if (tx && tx.to?.toLowerCase() === VAULT_ADDRESS.toLowerCase() && tx.value >= FEE_WEI) {
          const receipt = await tx.wait();
          if (receipt && receipt.status === 1) {
            paymentVerified = true;
            // Get block for timestamp
            const block = await provider.getBlock(receipt.blockNumber);
            if (block) paymentDate = new Date(block.timestamp * 1000);
            console.log(`[STRIKE VERIFIED] Direct hash confirmed.`);
          }
        }
      } catch (e) {
        console.error("Hash verification failed", e);
      }
    }

    // 4. Tier 3: Ledger Audit (Fallback)
    if (!paymentVerified) {
      console.log(`[LEDGER AUDIT] Scanning Sepolia for ${address}...`);
      const apiKey = process.env.ETHERSCAN_API_KEY || "YourApiKeyToken";
      const etherscanUrl = `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
      
      try {
        const ethResponse = await fetch(etherscanUrl);
        const ethData = await ethResponse.json();
        if (ethData.status === "1" && Array.isArray(ethData.result)) {
          const validTx = (ethData.result as any[]).find((tx) => 
            tx.to.toLowerCase() === VAULT_ADDRESS.toLowerCase() && 
            BigInt(tx.value) >= FEE_WEI &&
            tx.isError === "0"
          );
          if (validTx) {
            paymentVerified = true;
            paymentDate = new Date(parseInt(validTx.timeStamp) * 1000);
          }
        }
      } catch (e) {
        console.error("Ledger audit failed", e);
      }
    }

    // 5. Finalize access if verified
    if (paymentVerified) {
      const newExpiration = new Date(paymentDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      const newExpirationStr = newExpiration.toISOString().split('T')[0];

      if (process.env.PRIVATE_KEY) {
        console.log(`[SYNC STRIKE] Anchoring substrate...`);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const contractWithSigner = contract.connect(wallet) as any;
        const tokenKey = `${lowerAddress}_tokens`;
        contractWithSigner.write([lowerAddress, tokenKey], [newExpirationStr, "1000"])
          .catch((err: any) => console.error(`[SYNC ERROR]`, err));
      }

      return NextResponse.json({ 
        status: '200 OK', 
        message: 'Access Granted: Payment Verified',
        expiration: newExpirationStr,
        tokens: "1000"
      });
    }

    return NextResponse.json({ 
      error: '402 Payment Required', 
      message: 'Subscription required.',
      tokens: tokenBalance
    }, { status: 402 });

  } catch (error: any) {
    console.error('PrecisionBOM Gatekeeper Error:', error);
    return NextResponse.json({ error: 'Internal Error', details: error.message }, { status: 500 });
  }
}
