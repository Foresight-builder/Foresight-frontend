"use client";
import React from 'react';
import { useWallet } from '@/contexts/WalletContext';

const WalletSelector: React.FC = () => {
  const { 
    supportedWallets, 
    connectWallet, 
    hideWalletSelector, 
    showWalletSelector: showWalletSelectorState,
    isConnecting,
    account
  } = useWallet();

  const handleWalletSelect = async (walletId: string) => {
    await connectWallet(walletId);
  };

  // 如果没有显示选择器，就不显示
  if (!showWalletSelectorState) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 animate-in fade-in duration-200"
      onClick={hideWalletSelector}
    >
      <div 
        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl max-w-sm w-full mx-4 border border-blue-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-blue-900">连接钱包</h2>
            <button
              onClick={hideWalletSelector}
              className="text-blue-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-3">
            {supportedWallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleWalletSelect(wallet.id)}
                disabled={!wallet.supported || isConnecting}
                className={`w-full flex items-center p-4 rounded-xl transition-all duration-200 group ${
                  wallet.supported 
                    ? 'hover:bg-white/50 active:scale-95 border border-transparent hover:border-blue-200' 
                    : 'opacity-50 cursor-not-allowed'
                } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl border border-blue-100 group-hover:border-blue-200">
                    {wallet.icon ? (
                      <img 
                        src={wallet.icon} 
                        alt={wallet.name}
                        className="w-6 h-6 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-6 h-6 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-lg flex items-center justify-center text-xs font-medium text-blue-700 ${wallet.icon ? 'hidden' : ''}`}>
                      {wallet.name.charAt(0)}
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <div className="font-medium text-blue-900 text-sm">{wallet.name}</div>
                    <div className={`text-xs ${
                      wallet.supported ? 'text-blue-600' : 'text-blue-400'
                    }`}>
                      {wallet.supported ? wallet.description : '未检测到钱包'}
                    </div>
                  </div>
                </div>
                
                {!wallet.supported && (
                  <div className="text-xs text-blue-400 px-2 py-1 bg-blue-100 rounded-lg">
                    未安装
                  </div>
                )}
              </button>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-blue-100">
            <p className="text-xs text-blue-500 text-center">
              通过连接钱包，您同意我们的{' '}
              <a 
                href="#" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                服务条款
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletSelector;