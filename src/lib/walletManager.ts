// 简化版钱包管理器，只支持MetaMask
import { ethers } from 'ethers';

export interface WalletConnection {
  account: string;
  chainId: number;
  provider: ethers.BrowserProvider;
}

class WalletManager {
  private connection: WalletConnection | null = null;

  async connectWallet(): Promise<WalletConnection | null> {
    try {
      return await this.connectMetaMask();
    } catch (error) {
      console.error('连接MetaMask钱包失败:', error);
      throw error;
    }
  }

  private async connectMetaMask(): Promise<WalletConnection> {
    const ethereum = (window as any).ethereum;
    if (!ethereum?.isMetaMask) {
      throw new Error('请安装MetaMask钱包');
    }

    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error('用户拒绝了连接请求');
    }

    const provider = new ethers.BrowserProvider(ethereum);
    const network = await provider.getNetwork();

    this.connection = {
      account: accounts[0],
      chainId: Number(network.chainId),
      provider,
    };

    return this.connection;
  }

  async disconnectWallet(): Promise<void> {
    this.connection = null;
  }

  getCurrentConnection(): WalletConnection | null {
    return this.connection;
  }

  setupEventListeners(onAccountChange: (account: string) => void): void {
    const ethereum = (window as any).ethereum;
    if (ethereum && ethereum.on) {
      ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          onAccountChange(accounts[0]);
        } else {
          this.connection = null;
        }
      });

      ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }
}

export const walletManager = new WalletManager();