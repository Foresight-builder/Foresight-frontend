"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

export default function TopNavBar() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;
    const handler = (accounts: string[]) => {
      setAccount(accounts && accounts.length > 0 ? accounts[0] : null);
    };
    window.ethereum.on?.("accountsChanged", handler);
    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handler);
    };
  }, []);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      if (!window.ethereum) {
        window.open("https://metamask.io/download/", "_blank");
        return;
      }
      const accounts: string[] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts && accounts.length > 0 ? accounts[0] : null);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <nav className="relative z-10 flex items-center justify-between px-10 py-5">
      <div className="flex items-center">
        <img src="/images/logo.jpg" alt="logo" className="w-8 h-8" />
        <div className="ml-3">
          <h1 className="text-2xl font-semibold">Foresight</h1>
          <span className="text-sm text-black">Trade with confidence</span>
        </div>
      </div>
      <div className="space-x-8 hidden md:flex">
        <Link className="hover:text-black" href="/">
          Home
        </Link>
        <Link className="hover:text-black" href="/trending">
          Trending
        </Link>
        <a className="hover:text-black" href="#">
          Feature
        </a>
        <a className="hover:text-black" href="#">
          Free
        </a>
        <a className="hover:text-black" href="#">
          VIP
        </a>
        <a className="hover:text-black" href="#">
          Sigin in
        </a>
      </div>
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="px-4 py-2 bg-blue-500 text-black rounded-xl"
        title={account ? account : "Connect Ethereum wallet"}
      >
        {account
          ? `Connected ${formatAddress(account)}`
          : isConnecting
          ? "Connecting..."
          : "Launch DApp"}
      </button>
    </nav>
  );
}
