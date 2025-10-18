"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";

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
  const pathname = usePathname();

  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [hasProvider, setHasProvider] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // 弹窗打开时锁定滚动，关闭时恢复
  useEffect(() => {
    if (!mounted) return;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    if (connectError) {
      body.style.overflow = "hidden";
    }
    return () => {
      body.style.overflow = prevOverflow;
    };
  }, [connectError, mounted]);

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

  // 弹窗元素（通过 Portal 渲染，避免被任何父级 z-index/overflow 影响）
  const modal = connectError ? (
    <div
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center"
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
  ) : null;

  return (
    <nav className="relative z-10 flex items-center justify-between px-10 py-5">
      <div className="flex items-center">
        <img src="/images/logo.png" alt="logo" className="w-14 h-14" />
        <div className="ml-3">
          <h1 className="text-2xl font-semibold" style={{ color: "rgba(109, 40, 217, 1)" }}>Foresight</h1>
          <span className="text-sm text-black">Trade with confidence</span>
        </div>
      </div>
      <div className="space-x-8 hidden md:flex">
        <Link
          className="hover:text-black"
          href="/"
          aria-current={pathname === "/" ? "page" : undefined}
          style={pathname === "/" ? { color: "rgba(107, 33, 168, 1)" } : undefined}
        >
          Home
        </Link>
        <Link
          className="hover:text-black"
          href="/trending"
          aria-current={pathname === "/trending" ? "page" : undefined}
          style={pathname === "/trending" ? { color: "rgba(107, 33, 168, 1)" } : undefined}
        >
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
      </div>

      {mounted && modal && createPortal(modal, document.body)}
    </nav>
  );
}
