"use client";

import { useState } from 'react';
import { ethers } from 'ethers';

const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

const CLICKWRAP_MESSAGE = (nonce: string) => `PrecisionBOM Terminal Access & Sourcing Agreement: By signing this cryptographic strike, I acknowledge: 1. Authorization to interact with the PrecisionBOM forensic substrate. 2. Acceptance of the 0.001 ETH (Sepolia) monthly subscription fee. 3. Consent to the recording of all sourcing strikes within ERC-7827. NOTE: If no active substrate record is found for this identity, a transaction request for 0.001 Sepolia ETH will follow to initialize access. Session Nonce: ${nonce}`;

export default function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [tokens, setTokens] = useState<string>("0");
  const [loading, setLoading] = useState(false);

  const ensureSepolia = async (ethereum: EthereumProvider) => {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: SEPOLIA_CHAIN_ID,
            chainName: 'Sepolia Test Network',
            nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          }],
        });
      } else {
        throw switchError;
      }
    }
  };

  const paySubscription = async (userAddress: string, provider: ethers.BrowserProvider) => {
    const VAULT_ADDRESS = "0xd24fD54959A2303407505dC602e94BCdA5F4AcDD";
    const SUBSCRIPTION_FEE = "0.001"; // ETH
    try {
      const ethereum = (window as { ethereum?: EthereumProvider }).ethereum;
      if (ethereum) await ensureSepolia(ethereum);

      setStatus("Escalating to Payment...");
      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction({
        to: VAULT_ADDRESS,
        value: ethers.parseEther(SUBSCRIPTION_FEE)
      });

      setStatus("Processing Strike...");
      await tx.wait();
      setStatus("Payment Confirmed. Syncing (15s)...");
      
      // WAIT for Sepolia indexing
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      await checkAccess(userAddress, false);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Payment Error:", err);
      setStatus("Payment Cancelled/Failed");
    }
  };

  const checkAccess = async (userAddress: string, allowEscalation: boolean = true) => {
    setLoading(true);
    try {
      const ethereum = (window as { ethereum?: EthereumProvider }).ethereum;
      if (!ethereum) return;

      await ensureSepolia(ethereum);

      const provider = new ethers.BrowserProvider(ethereum as ethers.Eip1193Provider);
      const nonce = Date.now().toString();
      const signer = await provider.getSigner();
      
      console.log("Triggering Clickwrap Handshake...");
      const signature = await signer.signMessage(CLICKWRAP_MESSAGE(nonce));

      const response = await fetch('/api/gatekeeper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: userAddress, signature, nonce })
      });

      const data = await response.json();

      if (response.status === 200) {
        setStatus("Active");
        setTokens(data.tokens || "0");
        localStorage.setItem('forensic_identity', userAddress);
        localStorage.setItem('forensic_signature', signature);
        localStorage.setItem('forensic_nonce', nonce);
      } else if (response.status === 402) {
        setTokens(data.tokens || "0");
        if (allowEscalation) {
          await paySubscription(userAddress, provider);
        } else {
          setStatus("Payment Required");
        }
      } else {
        setStatus(`Error`);
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Access Check Error:", err);
      setStatus("Verification Failed");
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    const ethereum = (window as { ethereum?: EthereumProvider }).ethereum;
    if (typeof window !== 'undefined' && ethereum) {
      try {
        setLoading(true);
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' }) as string[];
        const userAddress = accounts[0];
        setAddress(userAddress);
        await checkAccess(userAddress);
      } catch (error: unknown) {
        const err = error as Error & { code?: number };
        console.error("Connection Error:", err);
        if (err.code === -32002) {
          alert("MetaMask request is already pending.");
        }
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please install a Web3 wallet (e.g., MetaMask)");
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setStatus(null);
    setTokens("0");
    localStorage.removeItem('forensic_identity');
    localStorage.removeItem('forensic_signature');
    localStorage.removeItem('forensic_nonce');
  };

  return (
    <div className="flex items-center gap-3">
      {address ? (
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end border-r border-substrate-800 pr-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-trace-400 font-bold font-mono">{tokens} T</span>
              <span className="text-[10px] text-trace-500 uppercase tracking-widest font-bold">
                {status}
              </span>
            </div>
            <span className="text-xs text-white opacity-70">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </div>
          <button
            onClick={disconnectWallet}
            className="text-[10px] uppercase tracking-tighter text-substrate-500 hover:text-red-400 transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={loading}
          className="text-sm px-4 py-2 border border-trace-500/30 hover:border-trace-500 text-trace-500 rounded transition-all hover:bg-trace-500/10 disabled:opacity-50"
        >
          {loading ? "Forensic Boot..." : "Connect Wallet"}
        </button>
      )}
    </div>
  );
}
