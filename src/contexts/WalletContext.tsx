"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
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
    
    // 检查是否有可用的钱包提供者
    const hasProvider = !!(window as any).ethereum?.isMetaMask;
    setWalletState(prev => ({ ...prev, hasProvider }));
    
    // 检查是否有已连接的钱包
    const checkConnection = async () => {
      try {
        const ethereum = (window as any).ethereum;
        if (ethereum) {
          const accounts = await ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setWalletState(prev => ({
              ...prev,
              account: accounts[0],
            }));
            
            // 设置事件监听
            setupEventListeners();
          }
        }
      } catch (error) {
        console.error("检查钱包连接失败:", error);
      }
    };
    
    checkConnection();
  }, []);

  const setupEventListeners = () => {
    const ethereum = (window as any).ethereum;
    if (ethereum && ethereum.on) {
      ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletState(prev => ({ ...prev, account: accounts[0] }));
        } else {
          setWalletState(prev => ({ 
            ...prev, 
            account: null,
            chainId: null,
            balanceEth: null 
          }));
        }
      });

      ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  };

  const connectWallet = async () => {
    if (!mounted) return;

    setWalletState(prev => ({ 
      ...prev, 
      isConnecting: true, 
      connectError: null
    }));

    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum?.isMetaMask) {
        throw new Error('请安装MetaMask钱包');
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts && accounts.length > 0) {
        const provider = new ethers.BrowserProvider(ethereum);
        const network = await provider.getNetwork();
        
        setWalletState(prev => ({
          ...prev,
          account: accounts[0],
          chainId: network.chainId.toString(),
          isConnecting: false,
        }));
        
        // 设置事件监听
        setupEventListeners();
        
        // 清除退出标记
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(LOGOUT_FLAG);
        }
      }
    } catch (error: any) {
      console.error("连接钱包失败:", error);
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        connectError: error.message || "连接钱包失败"
      }));
    }
  };

  const disconnectWallet = async () => {
    try {
      setWalletState(prev => ({
        ...prev,
        account: null,
        chainId: null,
        balanceEth: null,
      }));
      
      // 设置退出标记
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(LOGOUT_FLAG, "true");
      }
    } catch (error) {
      console.error("断开钱包连接失败:", error);
    }
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