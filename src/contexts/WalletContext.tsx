"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

interface WalletState {
  account: string | null;
  isConnecting: boolean;
  connectError: string | null;
  hasProvider: boolean;
  chainId: string | null;
  balanceEth: string | null;
  balanceLoading: boolean;
}

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  formatAddress: (addr: string) => string;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const LOGOUT_FLAG = "fs_wallet_logged_out";

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletState, setWalletState] = useState<WalletState>({
    account: null,
    isConnecting: false,
    connectError: null,
    hasProvider: false,
    chainId: null,
    balanceEth: null,
    balanceLoading: false,
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const ethereum = typeof window !== 'undefined' ? window.ethereum : undefined;
    if (!ethereum) {
      setWalletState(prev => ({ ...prev, hasProvider: false }));
      return;
    }

    setWalletState(prev => ({ ...prev, hasProvider: true }));

    // 初始账户状态（如果之前已授权，且未在本会话主动退出）
    const loggedOut = typeof window !== 'undefined' && sessionStorage.getItem(LOGOUT_FLAG) === 'true';

    if (!loggedOut) {
      ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          const account = accounts && accounts.length > 0 ? accounts[0] : null;
          setWalletState(prev => ({ ...prev, account }));
        })
        .catch(() => {});
    } else {
      // 明确清理本地状态，避免复用旧账户数据
      setWalletState(prev => ({ 
        ...prev, 
        account: null, 
        chainId: null, 
        balanceEth: null 
      }));
    }

    // 账户变更监听
    const handleAccountsChanged = (accounts: string[]) => {
      const account = accounts && accounts.length > 0 ? accounts[0] : null;
      setWalletState(prev => ({ 
        ...prev, 
        account,
        chainId: account ? prev.chainId : null,
        balanceEth: account ? prev.balanceEth : null
      }));
    };

    // 网络变更监听
    const handleChainChanged = (chainId: string) => {
      setWalletState(prev => ({ ...prev, chainId }));
    };

    ethereum.on?.("accountsChanged", handleAccountsChanged);
    ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  const connectWallet = async () => {
    setWalletState(prev => ({ ...prev, connectError: null, isConnecting: true }));
    const ethereum = typeof window !== 'undefined' ? window.ethereum : undefined;
    
    try {
      if (!ethereum) {
        setWalletState(prev => ({ 
          ...prev, 
          hasProvider: false, 
          connectError: "未检测到钱包，请安装 MetaMask" 
        }));
        window.open("https://metamask.io/download/", "_blank");
        return;
      }

      setWalletState(prev => ({ ...prev, hasProvider: true }));
      
      // 重新连接前移除登出标记，避免静默复用
      sessionStorage.removeItem(LOGOUT_FLAG);
      
      const accounts: string[] = await ethereum.request({
        method: "eth_requestAccounts",
      });
      
      const account = accounts && accounts.length > 0 ? accounts[0] : null;
      setWalletState(prev => ({ 
        ...prev, 
        account, 
        connectError: null, 
        isConnecting: false 
      }));
    } catch (err: any) {
      const errorMessage = err && (err.code === 4001 || err?.message?.includes("User rejected"))
        ? "用户拒绝连接钱包授权"
        : `连接失败：${err?.message || "未知错误"}`;
        
      setWalletState(prev => ({ 
        ...prev, 
        connectError: errorMessage, 
        isConnecting: false 
      }));
      console.error("Wallet connection failed:", err);
    }
  };

  const disconnectWallet = async () => {
    const ethereum = typeof window !== 'undefined' ? window.ethereum : undefined;
    
    try {
      await ethereum?.request?.({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      });
    } catch (e) {
      console.warn("Revoke permissions unsupported or failed:", e);
    }
    
    // 设置本会话登出标记，阻止后续静默恢复
    sessionStorage.setItem(LOGOUT_FLAG, "true");
    
    // 清理本地状态，避免复用
    setWalletState(prev => ({
      ...prev,
      account: null,
      chainId: null,
      balanceEth: null,
    }));
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const contextValue: WalletContextType = {
    ...walletState,
    connectWallet,
    disconnectWallet,
    formatAddress,
  };

  if (!mounted) {
    return null;
  }

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}