"use client";

import { useState } from 'react';
import { ethers } from 'ethers';

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

const CLICKWRAP_MESSAGE = (nonce: string) => `PrecisionBOM Terminal Access & Sourcing Agreement:
By signing this cryptographic strike, I acknowledge:
1. Authorization to interact with the PrecisionBOM forensic substrate.
2. Acceptance of the 0.001 ETH monthly subscription fee.
3. Consent to the recording of all sourcing strikes within ERC-7827.

Session Nonce: ${nonce}`;

export default function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checkAccess = async (userAddress: string) => {
    setLoading(true);
    try {
      const ethereum = (window as { ethereum?: EthereumProvider }).ethereum;
      if (!ethereum) return;

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
        setStatus(`Active (Until: ${data.expiration})`);
      } else if (response.status === 402) {
        setStatus(`Payment Required (x402)`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Access Check Error:", err);
      setStatus("Failed to verify identity");
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
        const err = error as Error;
        console.error("Connection Error:", err);
        if ((err as any).code === -32002) {
          alert("MetaMask request is already pending. Please open your wallet.");
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
  };

  return (
    <div className="flex items-center gap-3">
      {address ? (
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end border-r border-substrate-800 pr-3">
            <span className="text-[10px] text-trace-500 uppercase tracking-widest font-bold">
              {loading ? "Verifying..." : status}
            </span>
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
          {loading ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
    </div>
  );
}
