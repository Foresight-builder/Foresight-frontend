"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (
        event: string,
        handler: (...args: any[]) => void
      ) => void;
    };
  }
}

export default function TopNavBar() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [hasProvider, setHasProvider] = useState(false);

  useEffect(() => {
    const ethereum =
      typeof window !== "undefined" ? window.ethereum : undefined;
    if (!ethereum) {
      setHasProvider(false);
      return;
    }
    setHasProvider(true);

    // 初始账户状态（如果之前已授权）
    ethereum
      .request({ method: "eth_accounts" })
      .then((accounts: string[]) => {
        setAccount(accounts && accounts.length > 0 ? accounts[0] : null);
      })
      .catch(() => {});

    // 账户变更监听
    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts && accounts.length > 0 ? accounts[0] : null);
    };
    ethereum.on?.("accountsChanged", handleAccountsChanged);
    return () => {
      ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
    };
  }, []);

  const connectWallet = async () => {
    setConnectError(null);
    setIsConnecting(true);
    const ethereum =
      typeof window !== "undefined" ? window.ethereum : undefined;
    try {
      if (!ethereum) {
        setHasProvider(false);
        setConnectError("未检测到钱包，请安装 MetaMask");
        window.open("https://metamask.io/download/", "_blank");
        return;
      }
      setHasProvider(true);
      const accounts: string[] = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts && accounts.length > 0 ? accounts[0] : null);
      setConnectError(null);
    } catch (err: any) {
      if (
        err &&
        (err.code === 4001 || err?.message?.includes("User rejected"))
      ) {
        setConnectError("用户拒绝连接钱包授权");
      } else {
        setConnectError(`连接失败：${err?.message || "未知错误"}`);
      }
      console.error("Wallet connection failed:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

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
      <div className="flex items-center space-x-3">
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="px-4 py-2 bg-blue-500 text-black rounded-xl"
          title={
            account
              ? account
              : hasProvider
              ? "Connect Ethereum wallet"
              : "Install MetaMask"
          }
        >
          {account
            ? `Connected ${formatAddress(account)}`
            : isConnecting
            ? "Connecting..."
            : "Launch DApp"}
        </button>
        {connectError && (
          <span className="text-sm text-red-600" aria-live="polite">
            {connectError}
          </span>
        )}
      </div>
    </nav>
  );
}
