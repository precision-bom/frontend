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

interface EtherscanTx {
  to: string;
  value: string;
  isError: string;
  timeStamp: string;
  hash: string;
}

const CLICKWRAP_MESSAGE = (nonce: string) => `PrecisionBOM Terminal Access & Sourcing Agreement: By signing this cryptographic strike, I acknowledge: 1. Authorization to interact with the PrecisionBOM forensic substrate. 2. Acceptance of the 0.001 ETH (Sepolia) monthly subscription fee. 3. Consent to the recording of all sourcing strikes within ERC-7827. NOTE: If no active substrate record is found for this identity, a transaction request for 0.001 Sepolia ETH will follow to initialize access. Session Nonce: ${nonce}`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address')?.toLowerCase();

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  try {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com");
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    
    const jsonStateString = await contract.json();
    const state = JSON.parse(jsonStateString);
    const expirationDateStr = state[address];
    const tokenBalance = state[`${address}_tokens`] || "0";
    const now = new Date();

    if (expirationDateStr && new Date(expirationDateStr) > now) {
      return NextResponse.json({ 
        status: '200 OK', 
        message: 'Access Granted',
        expiration: expirationDateStr,
        tokens: tokenBalance
      });
    }

    return NextResponse.json({ 
      error: '402 Payment Required', 
      message: 'No active subscription found.',
      tokens: tokenBalance
    }, { status: 402 });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('PrecisionBOM Gatekeeper GET Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { address, signature, nonce } = await request.json();

    if (!address || !signature || !nonce) {
      return NextResponse.json({ error: 'Missing identity parameters' }, { status: 400 });
    }

    // 1. Identity Recovery
    let recoveredAddress: string;
    try {
      recoveredAddress = ethers.verifyMessage(CLICKWRAP_MESSAGE(nonce), signature);
    } catch (sigError: any) {
      return NextResponse.json({ error: `Signature recovery failed` }, { status: 401 });
    }

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json({ error: `Identity mismatch` }, { status: 401 });
    }

    console.log(`[FORENSIC VERIFIED] Identity ${recoveredAddress} confirmed.`);

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

    // 3. Tier 2: Ledger Audit
    console.log(`[LEDGER AUDIT] Scanning Sepolia for ${address}...`);
    
    const apiKey = process.env.ETHERSCAN_API_KEY || "YourApiKeyToken";
    const etherscanUrl = `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
    
    const ethResponse = await fetch(etherscanUrl);
    const ethData = await ethResponse.json();

    let paymentFound = false;
    let paymentDate = new Date();

    if (ethData.status === "1" && Array.isArray(ethData.result)) {
      const validTx = (ethData.result as EtherscanTx[]).find((tx) => 
        tx.to.toLowerCase() === VAULT_ADDRESS.toLowerCase() && 
        BigInt(tx.value) >= FEE_WEI &&
        tx.isError === "0"
      );

      if (validTx) {
        paymentFound = true;
        paymentDate = new Date(parseInt(validTx.timeStamp) * 1000);
        console.log(`[PAYMENT DISCOVERED] Found: ${validTx.hash}`);
      }
    }

    if (!paymentFound) {
      return NextResponse.json({ 
        error: '402 Payment Required', 
        message: 'Subscription strike required.',
        tokens: tokenBalance
      }, { status: 402 });
    }

    // 4. Tier 3: Auto-Write
    if (paymentFound && process.env.PRIVATE_KEY) {
      console.log(`[SYNC STRIKE] Executing substrate update for ${address}...`);
      const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      const contractWithSigner = contract.connect(wallet) as ethers.BaseContract & { write: (k: string[], v: string[]) => Promise<ethers.ContractTransactionResponse> };
      
      const newExpiration = new Date(paymentDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      const newExpirationStr = newExpiration.toISOString().split('T')[0];
      const tokenKey = `${lowerAddress}_tokens`;

      const tx = await contractWithSigner.write(
        [lowerAddress, tokenKey], 
        [newExpirationStr, "1000"]
      );
      console.log(`[TX SENT] Strike Hash: ${tx.hash}`);
      await tx.wait();
      console.log(`[TX CONFIRMED] Substrate anchored.`);

      return NextResponse.json({ 
        status: '200 OK', 
        message: 'Access Granted: Substrate Updated',
        expiration: newExpirationStr,
        tokens: "1000",
        strike_tx: tx.hash
      });
    }

    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('PrecisionBOM Gatekeeper POST Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}