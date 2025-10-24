"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { Copy, LogOut, Wallet, ExternalLink, ChevronDown } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import WalletModal from "./WalletModal";

export default function TopNavBar() {
  const pathname = usePathname();
  const {
    account,
    isConnecting,
    connectError,
    hasProvider,
    chainId,
    balanceEth,
    balanceLoading,
    connectWallet,
    disconnectWallet,
    formatAddress,
    availableWallets,
    currentWalletType,
  } = useWallet();

  const [mounted, setMounted] = useState(false);
  // 新增：头像菜单状态与复制状态
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [walletSelectorOpen, setWalletSelectorOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const walletSelectorRef = useRef<HTMLDivElement | null>(null);
  // 新增：用于菜单定位与门户内点击判断
  const avatarRef = useRef<HTMLImageElement | null>(null);
  const menuContentRef = useRef<HTMLDivElement | null>(null);
  const walletButtonRef = useRef<HTMLButtonElement | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const [walletSelectorPos, setWalletSelectorPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    setMounted(true);
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

  // 头像菜单：复制与断开
  const handleConnectWallet = async (walletType?: 'metamask' | 'coinbase' | 'binance') => {
    await connectWallet(walletType);
    setWalletSelectorOpen(false);
  };

  const handleWalletSelectorToggle = () => {
    setWalletSelectorOpen(!walletSelectorOpen);
  };

  const handleDisconnectWallet = async () => {
    await disconnectWallet();
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
      const cid: string = await ethereum.request({ method: "eth_chainId" });
      const balHex: string = await ethereum.request({
        method: "eth_getBalance",
        params: [account, "latest"],
      });
      const balDec = parseInt(balHex, 16);
      const eth = balDec / 1e18;
    } catch (e) {
      console.error("Fetch balance failed:", e);
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

  // 外部点击与 Esc 关闭菜单（兼容门户内菜单）
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      // 点击头像或菜单内容不关闭
      if (avatarRef.current && avatarRef.current.contains(target)) return;
      if (menuContentRef.current && menuContentRef.current.contains(target))
        return;
      // 点击钱包选择器按钮或内容不关闭
      if (walletButtonRef.current && walletButtonRef.current.contains(target)) return;
      if (walletSelectorRef.current && walletSelectorRef.current.contains(target)) return;
      setMenuOpen(false);
      setWalletSelectorOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setWalletSelectorOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // 新增：根据头像位置计算菜单的固定坐标
  useEffect(() => {
    const updateMenuPosition = () => {
      if (!avatarRef.current) return;
      const rect = avatarRef.current.getBoundingClientRect();
      const menuWidth = 256; // w-64
      const gap = 8; // 8px 间距
      let left = rect.right - menuWidth;
      let top = rect.bottom + gap;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      left = Math.max(8, Math.min(left, vw - menuWidth - 8));
      top = Math.max(8, Math.min(top, vh - 8));
      setMenuPos({ top, left });
    };

    if (menuOpen) {
      updateMenuPosition();
      const handler = () => updateMenuPosition();
      window.addEventListener("resize", handler);
      window.addEventListener("scroll", handler, true);
      return () => {
        window.removeEventListener("resize", handler);
        window.removeEventListener("scroll", handler, true);
      };
    }
  }, [menuOpen]);

  // 新增：根据钱包按钮位置计算选择器的固定坐标
  useEffect(() => {
    const updateWalletSelectorPosition = () => {
      if (!walletButtonRef.current) return;
      const rect = walletButtonRef.current.getBoundingClientRect();
      const selectorWidth = 200; // 选择器宽度
      const gap = 8; // 8px 间距
      let left = rect.left;
      let top = rect.bottom + gap;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      left = Math.max(8, Math.min(left, vw - selectorWidth - 8));
      top = Math.max(8, Math.min(top, vh - 8));
      setWalletSelectorPos({ top, left });
    };

    if (walletSelectorOpen) {
      updateWalletSelectorPosition();
      const handler = () => updateWalletSelectorPosition();
      window.addEventListener("resize", handler);
      window.addEventListener("scroll", handler, true);
      return () => {
        window.removeEventListener("resize", handler);
        window.removeEventListener("scroll", handler, true);
      };
    }
  }, [walletSelectorOpen]);

  // 弹窗元素（通过 Portal 渲染，避免被任何父级 z-index/overflow 影响）
  const modal = connectError ? (
    <div
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center"
      onClick={() => {}}
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
            onClick={() => {
              // 通过 useWallet 返回的 connectError 是只读状态，不能直接 set
              // 这里改为调用 connectWallet 重试或简单关闭弹窗即可
              // 如需重置错误，需在 WalletContext 中提供 resetConnectError 方法
              // 目前仅关闭弹窗，由上下文在下次连接前自动清除错误
              location.reload(); // 简单刷新以清除错误状态
            }}
          >
            关闭
          </button>
          <button
            className="px-3 py-2 rounded-md bg-blue-500 text-black"
            onClick={() => connectWallet()}
          >
            重试连接
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <nav className="relative z-10 flex items-center justify-between px-10 py-5">
      <Link href="/" className="flex items-center -ml-3 group">
        <img 
          src="/images/logo.png" 
          alt="Foresight Logo" 
          className="w-12 h-12 drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300 group-hover:scale-105" 
        />
        <div className="ml-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-indigo-700 transition-all duration-300">
            Foresight
          </h1>
          <span className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Insight to outcome</span>
        </div>
      </Link>
      <div className="space-x-8 hidden md:flex text-lg font-semibold">
        <Link
          className="text-black hover:text-black"
          href="/"
          aria-current={pathname === "/" ? "page" : undefined}
          style={
            pathname === "/" ? { color: "rgba(107, 33, 168, 1)" } : undefined
          }
        >
          Home
        </Link>
        <Link
          className="text-black hover:text-black"
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
        <Link
          className="text-black hover:text-black"
          href="/creating"
          aria-current={pathname === "/creating" ? "page" : undefined}
          style={
            pathname === "/creating"
              ? { color: "rgba(107, 33, 168, 1)" }
              : undefined
          }
        >
          Creating
        </Link>
        <a className="text-black hover:text-black" href="#">
          Free
        </a>
        <a className="text-black hover:text-black" href="#">
          VIP
        </a>
        <a className="text-black hover:text-black" href="#">
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
                ref={avatarRef}
              />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-[#0a0a0a]" />
            {/* 显示当前连接的钱包类型 */}
            {currentWalletType && (
              <span className="absolute -top-1 -right-1 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
                {currentWalletType === 'metamask' ? 'MM' : 
                 currentWalletType === 'coinbase' ? 'CB' : 
                 currentWalletType === 'okx' ? 'OKX' : 'BN'}
              </span>
            )}
            {/* 菜单通过 Portal 渲染为最高优先级 */}
            {menuOpen &&
              mounted &&
              createPortal(
                <>
                  {/* 点击遮罩关闭，避免被父级样式影响 */}
                  <div
                    className="fixed inset-0 z-[9998]"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div
                    ref={menuContentRef}
                    className="fixed z-[9999] w-64 bg-white/90 backdrop-blur-md border border-[rgba(168,85,247,0.25)] rounded-xl shadow-2xl p-2"
                    role="menu"
                    aria-label="用户菜单"
                    style={{ top: menuPos.top, left: menuPos.left }}
                    onClick={(e) => e.stopPropagation()}
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
                      onClick={handleDisconnectWallet}
                      className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-md hover:bg-purple-50 text-black"
                    >
                      <LogOut className="w-4 h-4 text-black" />
                      <span>断开连接</span>
                    </button>
                  </div>
                </>,
                document.body
              )}
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setWalletModalOpen(true)}
              disabled={isConnecting}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2"
              title="连接钱包"
            >
              {isConnecting ? "连接中..." : "连接钱包"}
              <Wallet className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {mounted && modal && createPortal(modal, document.body)}
      
      {/* 钱包连接弹窗 */}
      {mounted && (
        <WalletModal 
          isOpen={walletModalOpen} 
          onClose={() => setWalletModalOpen(false)} 
        />
      )}
    </nav>
  );
}
