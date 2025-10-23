'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, Share2, Check, ArrowUp } from 'lucide-react';

interface PredictionDetail {
  id: number;
  title: string;
  description: string;
  category: string;
  deadline: string;
  minStake: number;
  criteria: string;
  referenceUrl: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  stats: {
    yesAmount: number;
    noAmount: number;
    totalAmount: number;
    participantCount: number;
    yesProbability: number;
    noProbability: number;
    betCount: number;
  };
  timeInfo: {
    createdAgo: string;
    deadlineIn: string;
    isExpired: boolean;
  };
}

export default function PredictionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [prediction, setPrediction] = useState<PredictionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [entered, setEntered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const fetchPredictionDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/predictions/${params.id}`);
        const contentType = response.headers.get('content-type') || '';
        let result: any = null;
        try {
          if (contentType.includes('application/json')) {
            result = await response.json();
          } else {
            throw new Error(`Unexpected content-type: ${contentType}`);
          }
        } catch (e) {
          console.error('解析响应失败:', e);
          setError('数据解析失败');
          return;
        }
        
        if (result.success) {
          setPrediction(result.data);
        } else {
          setError(result.message || '获取预测事件详情失败');
        }
      } catch (err) {
        setError('网络请求失败');
        console.error('获取预测事件详情失败:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPredictionDetail();
    }
  }, [params.id]);

  useEffect(() => {
    // 设置页面进入动画状态
    setEntered(true);
    
    const onScroll = () => {
      if (typeof window !== 'undefined') {
        setShowScrollTop(window.scrollY > 200);
      }
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    router.prefetch('/trending');
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载预测事件详情中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">加载失败</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">预测事件不存在</h2>
          <p className="text-gray-600">请检查事件ID是否正确</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
        <div className={`max-w-4xl mx-auto transition-all duration-200 ease-out ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>
          {/* 返回按钮 */}
          <button
            type="button"
            aria-label="返回上一页"
            title="返回上一页"
            onClick={() => {
              const hasHistory = typeof window !== 'undefined' && window.history && window.history.length > 1;
              const sameOriginReferrer = typeof document !== 'undefined' && document.referrer && (() => {
                try {
                  const ref = new URL(document.referrer);
                  return ref.origin === window.location.origin;
                } catch {
                  return false;
                }
              })();
              startTransition(() => {
                if (hasHistory && sameOriginReferrer) {
                  router.back();
                } else {
                  router.push('/trending');
                }
              });
            }}
            disabled={isPending}
            className="mb-6 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/60 backdrop-blur-md border border-gray-200 text-gray-700 hover:text-gray-800 hover:bg-white/75 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
            <span className="text-sm font-medium">{isPending ? '返回中…' : '返回'}</span>
          </button>
          {/* 分享按钮 */}
          <button
            type="button"
            aria-label="复制链接"
            title="复制链接"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              } catch (e) {
                console.error('复制失败', e);
              }
            }}
            className="mb-6 ml-3 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/60 backdrop-blur-md border border-gray-200 text-gray-700 hover:text-gray-800 hover:bg-white/75 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-white"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Share2 className="w-4 h-4 text-gray-600" />
            )}
            <span className="text-sm font-medium">{copied ? '已复制' : '分享'}</span>
          </button>

          {/* 预测事件卡片 - 与creating预览保持一致 */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            {/* 卡片头部 - 渐变背景 */}
            <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">
                      {prediction.category === '科技' ? '🚀' : 
                       prediction.category === '娱乐' ? '🎬' :
                       prediction.category === '时政' ? '🏛️' :
                       prediction.category === '天气' ? '🌤️' : '📊'}
                    </span>
                    <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
                      {prediction.category}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    prediction.status === 'active' ? 'bg-green-100/20 text-green-100' :
                    prediction.status === 'completed' ? 'bg-blue-100/20 text-blue-100' :
                    'bg-gray-100/20 text-gray-100'
                  }`}>
                    {prediction.status === 'active' ? '进行中' :
                     prediction.status === 'completed' ? '已结束' : '已取消'}
                  </span>
                </div>
                <h1 className="text-2xl font-bold leading-tight">{prediction.title}</h1>
              </div>
            </div>

            {/* 卡片内容 */}
            <div className="p-6">
              {/* 时间信息 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>创建于 {prediction.timeInfo.createdAgo}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span className={prediction.timeInfo.isExpired ? 'text-red-600' : 'text-orange-600'}>
                    {prediction.timeInfo.deadlineIn}
                  </span>
                </div>
              </div>

              {/* 描述 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">事件描述</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{prediction.description}</p>
              </div>

              {/* 判断标准 */}
              <div className="p-4 bg-gray-50 rounded-lg mb-6">
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-600">判断标准</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{prediction.criteria}</p>
              </div>

              {/* 参考链接 */}
              {prediction.referenceUrl && (
                <div className="mb-6">
                  <a 
                    href={prediction.referenceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    参考链接
                  </a>
                </div>
              )}

              {/* 押注统计 */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">押注统计</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{prediction.stats.participantCount}</div>
                    <div className="text-sm text-gray-600">参与人数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{prediction.stats.betCount}</div>
                    <div className="text-sm text-gray-600">押注次数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{prediction.stats.totalAmount.toFixed(2)} USDT</div>
                    <div className="text-sm text-gray-600">总押注金额</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{prediction.minStake} USDT</div>
                    <div className="text-sm text-gray-600">最小押注</div>
                  </div>
                </div>

                {/* 概率分布 */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>是 ({prediction.stats.yesProbability * 100}%)</span>
                    <span>否 ({prediction.stats.noProbability * 100}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${prediction.stats.yesProbability * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* 金额分布 */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>是: {prediction.stats.yesAmount.toFixed(2)} USDT</span>
                    <span>否: {prediction.stats.noAmount.toFixed(2)} USDT</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${prediction.stats.totalAmount > 0 ? (prediction.stats.yesAmount / prediction.stats.totalAmount) * 100 : 50}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 押注操作区域 */}
          {prediction.status === 'active' && !prediction.timeInfo.isExpired && (
            <div className="mt-6 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">参与押注</h3>
              <div className="flex gap-3">
                <button className="flex-1 py-3 px-4 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors">
                  支持 (预测达成)
                </button>
                <button className="flex-1 py-3 px-4 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
                  反对 (预测不达成)
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-3">最小押注金额: {prediction.minStake} USDT</p>
            </div>
          )}
        </div>
        {/* 悬浮回到顶部按钮 */}
        <button
          type="button"
          aria-label="回到顶部"
          title="回到顶部"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className={`${showScrollTop ? 'opacity-100' : 'opacity-0 pointer-events-none'} fixed bottom-6 right-6 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 text-gray-700 shadow-md hover:shadow-lg hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-gray-300`}
        >
          <ArrowUp className="w-4 h-4" />
          <span className="text-sm">顶部</span>
        </button>
      </div>
    </div>
  );
}