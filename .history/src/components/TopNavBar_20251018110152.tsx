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
  const [connectError, setConnectError] = useState<string | null>(null);
  const [hasProvider, setHasProvider] = useState(false);

  useEffect(() => {
    const ethereum = typeof window !== "undefined" ? window.ethereum : undefined;
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

  // ESC 关闭弹窗
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConnectError(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const connectWallet = async () => {
    setConnectError(null);
    setIsConnecting(true);
    const ethereum = typeof window !== "undefined" ? window.ethereum : undefined;
    try {
      if (!ethereum) {
        setHasProvider(false);
        setConnectError("未检测到钱包，请安装 MetaMask");
        window.open("https://metamask.io/download/", "_blank");
        return;
      }
      setHasProvider(true);
      const accounts: string[] = await ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts && accounts.length > 0 ? accounts[0] : null);
      setConnectError(null);
    } catch (err: any) {
      if (err && (err.code === 4001 || err?.message?.includes("User rejected"))) {
        setConnectError("用户拒绝连接钱包授权");
      } else {
        setConnectError(`连接失败：${err?.message || "未知错误"}`);
      }
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
      <div className="flex items-center space-x-3">
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="px-4 py-2 bg-blue-500 text-black rounded-xl"
          title={account ? account : hasProvider ? "Connect Ethereum wallet" : "Install MetaMask"}
        >
          {account
            ? `Connected ${formatAddress(account)}`
            : isConnecting
            ? "Connecting..."
            : "Launch DApp"}
        </button>
      </div>

      {/* 连接失败弹窗 */}
      {connectError && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setConnectError(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-[90%]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-black mb-2">连接钱包失败</h3>
            <p className="text-sm text-black mb-4">{connectError}</p>
            {!hasProvider && (
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-black underline"
              >
                安装 MetaMask 浏览器扩展
              </a>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-3 py-2 rounded-md border border-gray-300 text-black"
                onClick={() => setConnectError(null)}
              >
                关闭
              </button>
              <button
                className="px-3 py-2 rounded-md bg-blue-500 text-black"
                onClick={connectWallet}
              >
                重试连接
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
