"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { Copy, LogOut, Wallet, ExternalLink } from "lucide-react";

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
  // 新增：头像菜单状态与复制状态
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  // 新增：网络与余额状态
  const [chainId, setChainId] = useState<string | null>(null);
  const [balanceEth, setBalanceEth] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

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

  // 头像菜单：复制与断开
  const disconnectWallet = () => {
    setAccount(null);
    setMenuOpen(false);
  };

  const copyAddress = async () => {
    if (!account) return;
    try {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  // 新增：网络名称、区块浏览器、余额刷新、网络切换
  const networkName = (id: string | null) => {
    if (!id) return "未知网络";
    switch (id.toLowerCase()) {
      case "0x1":
        return "Ethereum";
      case "0xaa36a7":
        return "Sepolia";
      case "0x5":
        return "Goerli";
      case "0x89":
        return "Polygon";
      case "0x38":
        return "BSC";
      default:
        return id;
    }
  };

  const explorerBase = (id: string | null) => {
    const low = id?.toLowerCase();
    switch (low) {
      case "0x1":
        return "https://etherscan.io";
      case "0xaa36a7":
        return "https://sepolia.etherscan.io";
      case "0x5":
        return "https://goerli.etherscan.io";
      case "0x89":
        return "https://polygonscan.com";
      case "0x38":
        return "https://bscscan.com";
      default:
        return "https://etherscan.io";
    }
  };

  const updateNetworkInfo = async () => {
    const ethereum =
      typeof window !== "undefined" ? window.ethereum : undefined;
    if (!ethereum || !account) return;
    try {
      setBalanceLoading(true);
      const cid: string = await ethereum.request({ method: "eth_chainId" });
      setChainId(cid);
      const balHex: string = await ethereum.request({
        method: "eth_getBalance",
        params: [account, "latest"],
      });
      const balDec = parseInt(balHex, 16);
      const eth = balDec / 1e18;
      setBalanceEth(eth.toFixed(4));
    } catch (e) {
      console.error("Fetch balance failed:", e);
      setBalanceEth(null);
    } finally {
      setBalanceLoading(false);
    }
  };

  useEffect(() => {
    updateNetworkInfo();
  }, [account]);

  const openOnExplorer = () => {
    if (!account) return;
    const url = `${explorerBase(chainId)}/address/${account}`;
    window.open(url, "_blank");
    setMenuOpen(false);
  };

  const switchToSepolia = async () => {
    const ethereum =
      typeof window !== "undefined" ? window.ethereum : undefined;
    if (!ethereum) return;
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });
      updateNetworkInfo();
    } catch (e) {
      console.error("Switch chain failed:", e);
    } finally {
      setMenuOpen(false);
    }
  };

  // 外部点击与 Esc 关闭菜单
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

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
          <h1
            className="text-2xl font-semibold"
            style={{ color: "rgba(109, 40, 217, 1)" }}
          >
            Foresight
          </h1>
          <span className="text-sm text-black">Insight to outcome</span>
        </div>
      </div>
      <div className="space-x-8 hidden md:flex">
        <Link
          className="hover:text-black"
          href="/"
          aria-current={pathname === "/" ? "page" : undefined}
          style={
            pathname === "/" ? { color: "rgba(107, 33, 168, 1)" } : undefined
          }
        >
          Home
        </Link>
        <Link
          className="hover:text-black"
          href="/trending"
          aria-current={pathname === "/trending" ? "page" : undefined}
          style={
            pathname === "/trending"
              ? { color: "rgba(107, 33, 168, 1)" }
              : undefined
          }
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
        {account ? (
          <div className="relative group" ref={menuRef}>
            <div className="p-[2px] rounded-full bg-gradient-to-r from-[rgba(244,114,182,1)] to-[rgba(168,85,247,1)]">
              <img
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${account}`}
                alt="User avatar"
                title={account}
                role="button"
                aria-label="打开用户菜单"
                aria-expanded={menuOpen}
                tabIndex={0}
                className="w-10 h-10 rounded-full bg-white shadow-sm cursor-pointer transition-all duration-200 focus:outline-none focus-visible:shadow-md"
                onClick={() => setMenuOpen((v) => !v)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    setMenuOpen((v) => !v);
                }}
              />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-[#0a0a0a]" />
            {menuOpen && (
              <div
                className="absolute right-0 top-12 w-64 bg-white/90 backdrop-blur-md border border-[rgba(168,85,247,0.25)] rounded-xl shadow-xl p-2"
                role="menu"
                aria-label="用户菜单"
              >
                <div className="px-3 py-2 mb-2 rounded-lg bg-white/60 flex items-center justify-between">
                  <div className="text-xs text-black/80">
                    {formatAddress(account)}
                    <span className="ml-2 inline-block text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-black">
                      {networkName(chainId)}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-black">
                    {balanceLoading
                      ? "..."
                      : balanceEth
                      ? `${balanceEth} ETH`
                      : "--"}
                  </div>
                </div>
                <button
                  onClick={updateNetworkInfo}
                  className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-md hover:bg-purple-50 text-black"
                >
                  <Wallet className="w-4 h-4 text-black" />
                  <span>刷新余额</span>
                </button>
                <button
                  onClick={copyAddress}
                  className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-md hover:bg-purple-50 text-black"
                >
                  <Copy className="w-4 h-4 text-black" />
                  <span>{copied ? "已复制 ✓" : "复制地址"}</span>
                </button>
                <button
                  onClick={openOnExplorer}
                  className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-md hover:bg-purple-50 text-black"
                >
                  <ExternalLink className="w-4 h-4 text-black" />
                  <span>在区块浏览器查看</span>
                </button>
                <div className="my-1 border-t border-purple-100/60" />
                <button
                  onClick={switchToSepolia}
                  className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-md hover:bg-purple-50 text-black"
                >
                  <Wallet className="w-4 h-4 text-black" />
                  <span>切换到 Sepolia 网络</span>
                </button>
                <button
                  onClick={disconnectWallet}
                  className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-md hover:bg-purple-50 text-black"
                >
                  <LogOut className="w-4 h-4 text-black" />
                  <span>断开连接</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="px-4 py-2 bg-gradient-to-r from-[rgba(244,114,182,1)] to-[rgba(168,85,247,1)] text-black rounded-xl"
            title={hasProvider ? "Connect Ethereum wallet" : "Install MetaMask"}
          >
            {isConnecting ? "Connecting..." : "Launch DApp"}
          </button>
        )}
      </div>

      {mounted && modal && createPortal(modal, document.body)}
    </nav>
  );
}
