"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Shield,
  Zap,
  Users,
  BarChart3,
  Wallet,
  Gift,
  Search,
  ChevronsUpDown,
  Check,
  Heart,
  CheckCircle,
  ArrowUp
} from "lucide-react";
import TopNavBar from "@/components/TopNavBar";
import Link from "next/link";
import { useWallet } from "@/contexts/WalletContext";

export default function TrendingPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const mainContentRef = useRef<HTMLDivElement | null>(null);

  // 侧边栏数据
  const sidebarData = {
    recentEvents: [
      { name: "以太坊2.0升级", icon: "🚀", time: "2小时前", category: "科技" },
      { name: "比特币减半", icon: "💰", time: "5小时前", category: "区块链" },
      { name: "AI技术突破", icon: "🤖", time: "1天前", category: "科技" },
      { name: "全球气候峰会", icon: "🌍", time: "1天前", category: "时政" },
      { name: "电影票房预测", icon: "🎬", time: "2天前", category: "娱乐" },
      { name: "体育赛事结果", icon: "⚽", time: "3天前", category: "体育" },
    ],
    trendingPredictions: [
      { name: "以太坊价格预测", volume: "245 USDT", trend: "up" },
      { name: "比特币减半影响", volume: "189 USDT", trend: "up" },
      { name: "AI技术突破预测", volume: "320 USDT", trend: "down" },
      { name: "全球气候峰会结果", volume: "150 USDT", trend: "down" },
      { name: "电影票房预测", volume: "210 USDT", trend: "up" },
      { name: "体育赛事结果", volume: "133 USDT", trend: "up" },
    ],
    platformStats: {
      totalInsured: "1,208 USDT",
      activeUsers: "2,456",
      claimsPaid: "89 USDT",
    },
  };

  // 添加热点事件轮播数据
  const heroEvents = [
    {
      title: "全球气候峰会",
      description: "讨论全球气候变化的应对策略",
      image:
        "https://images.unsplash.com/photo-1569163139394-de44cb4e4c81?auto=format&fit=crop&w=1000&q=80",
      followers: 12842,
      category: "时政",
    },
    {
      title: "AI安全大会",
      description: "聚焦AI监管与安全问题",
      image:
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80",
      followers: 9340,
      category: "科技",
    },
    {
      title: "国际金融论坛",
      description: "探讨数字货币与未来经济",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80",
      followers: 7561,
      category: "时政",
    },
    {
      title: "体育公益赛",
      description: "全球运动员联合助力慈善",
      image:
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80",
      followers: 5043,
      category: "娱乐",
    },
    {
      title: "极端天气预警",
      description: "全球多地发布极端天气预警",
      image:
        "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=1000&q=80",
      followers: 8921,
      category: "天气",
    },
    {
      title: "科技新品发布",
      description: "最新科技产品震撼发布",
      image:
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1000&q=80",
      followers: 7654,
      category: "科技",
    },
  ];

  // 专题板块数据
  const categories = [
    { name: "科技", icon: "🚀", color: "from-blue-400 to-cyan-400" },
    { name: "娱乐", icon: "🎬", color: "from-pink-400 to-rose-400" },
    { name: "时政", icon: "🏛️", color: "from-purple-400 to-indigo-400" },
    { name: "天气", icon: "🌤️", color: "from-green-400 to-emerald-400" },
  ];

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortOption, setSortOption] = useState<"default" | "minInvestment-asc" | "insured-desc">("default");
  const [displayCount, setDisplayCount] = useState(6);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortOpen, setSortOpen] = useState(false);
  const [totalEventsCount, setTotalEventsCount] = useState(0);
  const sortRef = useRef<HTMLDivElement | null>(null);
  const productsSectionRef = useRef<HTMLElement | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  
  // 登录提示弹窗状态
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // 关注功能状态管理
  const [followedEvents, setFollowedEvents] = useState<Set<number>>(new Set());
  const { account } = useWallet();
  
  // 返回顶部功能状态
  const [showBackToTop, setShowBackToTop] = useState(false);

  // 滚动监听 - 显示/隐藏返回顶部按钮
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowBackToTop(scrollTop > 300);
      
      // 计算滚动进度
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 初始化检查

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 返回顶部函数
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 获取分类热点数量
  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const response = await fetch('/api/categories/counts');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // 将数组转换为对象，方便查找
            const countsObj: Record<string, number> = {};
            data.data.forEach((item: { category: string; count: number }) => {
              countsObj[item.category] = item.count;
            });
            setCategoryCounts(countsObj);
          }
        }
      } catch (error) {
        console.error('获取分类热点数量失败:', error);
      }
    };

    fetchCategoryCounts();
  }, []);

  // 关注/取消关注事件
  const toggleFollow = (eventIndex: number, event: React.MouseEvent) => {
    if (!account) {
      // 如果用户未连接钱包，显示登录提示弹窗
      setShowLoginModal(true);
      return;
    }
    
    const isFollowing = followedEvents.has(eventIndex);
    
    // 创建涟漪效果
    createSmartClickEffect(event);
    
    setFollowedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventIndex)) {
        newSet.delete(eventIndex);
      } else {
        newSet.add(eventIndex);
      }
      return newSet;
    });
    
    // 创建粒子效果
    createHeartParticles(eventIndex, isFollowing);
  };

  // 优雅点击反馈效果
  const createSmartClickEffect = (event: React.MouseEvent) => {
    const button = event.currentTarget as HTMLElement;
    
    // 分析按钮类型和特征
    const buttonText = button.textContent?.toLowerCase() || '';
    const buttonClasses = button.className || '';
    const rect = button.getBoundingClientRect();
    const buttonSize = Math.max(rect.width, rect.height);
    
    // 根据按钮特征确定特效类型和颜色
    let effectType = 'default';
    let effectColor = '#8B5CF6'; // 默认紫色
    let glowColor = 'rgba(139, 92, 246, 0.15)';
    
    if (buttonText.includes('关注') || buttonText.includes('follow') || buttonClasses.includes('heart')) {
      // 关注按钮 - 使用爱心粒子特效（不在这里处理，在toggleFollow中处理）
      effectType = 'heart';
      effectColor = '#EF4444';
      glowColor = 'rgba(239, 68, 68, 0.15)';
    } else if (buttonText.includes('搜索') || buttonText.includes('search')) {
      // 搜索按钮 - 蓝色光晕+缩放
      effectType = 'search';
      effectColor = '#3B82F6';
      glowColor = 'rgba(59, 130, 246, 0.15)';
    } else if (buttonText.includes('重置') || buttonText.includes('reset')) {
      // 重置按钮 - 灰色涟漪+缩放
      effectType = 'reset';
      effectColor = '#6B7280';
      glowColor = 'rgba(107, 114, 128, 0.15)';
    } else if (buttonClasses.includes('category') || buttonText.includes('科技') || buttonText.includes('娱乐') || 
               buttonText.includes('时政') || buttonText.includes('天气')) {
      // 分类标签 - 使用爱心粒子特效，根据方框颜色调整粒子颜色
      effectType = 'category';
      
      // 根据分类名称设置对应的粒子颜色
      if (buttonText.includes('科技')) {
        effectColor = '#3B82F6'; // 蓝色
        glowColor = 'rgba(59, 130, 246, 0.15)';
      } else if (buttonText.includes('娱乐')) {
        effectColor = '#EC4899'; // 粉色
        glowColor = 'rgba(236, 72, 153, 0.15)';
      } else if (buttonText.includes('时政')) {
        effectColor = '#8B5CF6'; // 紫色
        glowColor = 'rgba(139, 92, 246, 0.15)';
      } else if (buttonText.includes('天气')) {
        effectColor = '#10B981'; // 绿色
        glowColor = 'rgba(16, 185, 129, 0.15)';
      } else {
        effectColor = '#8B5CF6'; // 默认紫色
        glowColor = 'rgba(139, 92, 246, 0.15)';
      }
      
      // 为分类按钮创建爱心粒子特效
      createHeartParticlesForCategory(event.nativeEvent, effectColor);
      return; // 直接返回，不执行后续的通用特效
    } else if (buttonClasses.includes('product') || buttonClasses.includes('card')) {
      // 产品卡片 - 渐变光晕
      effectType = 'product';
      effectColor = '#A855F7';
      glowColor = 'rgba(168, 85, 247, 0.15)';
    } else {
      // 默认按钮 - 紫色光晕+涟漪
      effectType = 'default';
    }
    
    // 根据按钮大小调整特效尺寸
    const sizeMultiplier = Math.max(0.8, Math.min(2.5, buttonSize / 50));
    const rippleSize = Math.max(rect.width, rect.height) * (1.5 + sizeMultiplier * 0.3);
    const glowSize = 1.5 + sizeMultiplier * 0.5;
    
    // 1. 智能光晕扩散效果 - 根据按钮类型调整颜色（移除震动效果）
    const glow = document.createElement('div');
    glow.style.position = 'fixed';
    glow.style.top = '0';
    glow.style.left = '0';
    glow.style.width = '100%';
    glow.style.height = '100%';
    glow.style.background = `radial-gradient(circle at ${event.clientX}px ${event.clientY}px, 
      ${glowColor} 0%, 
      ${glowColor.replace('0.15', '0.1')} 25%, 
      ${glowColor.replace('0.15', '0.05')} 40%, 
      transparent 70%)`;
    glow.style.pointerEvents = 'none';
    glow.style.zIndex = '9999';
    glow.style.opacity = '0';
    
    document.body.appendChild(glow);
    
    // 智能光晕动画 - 根据按钮大小调整扩散范围
    glow.animate([
      { opacity: 0, transform: 'scale(0.8)' },
      { opacity: 0.6, transform: `scale(${glowSize})` },
      { opacity: 0, transform: `scale(${glowSize * 1.2})` }
    ], {
      duration: 600,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });
    
    setTimeout(() => glow.remove(), 600);
    
    // 2. 智能水波纹效果 - 根据按钮类型调整效果
    const buttonRect = button.getBoundingClientRect();
    const clickX = event.clientX - buttonRect.left;
    const clickY = event.clientY - buttonRect.top;
    
    const ripple = document.createElement('span');
    ripple.className = 'absolute rounded-full pointer-events-none';
    ripple.style.width = ripple.style.height = rippleSize + 'px';
    ripple.style.left = clickX - rippleSize / 2 + 'px';
    ripple.style.top = clickY - rippleSize / 2 + 'px';
    
    // 根据按钮类型设置不同的波纹效果
    if (effectType === 'search') {
      // 搜索按钮：蓝色渐变波纹
      ripple.style.background = `radial-gradient(circle, rgba(255,255,255,0.9) 0%, 
        ${effectColor}50 30%, ${effectColor}30 60%, transparent 90%)`;
      ripple.style.boxShadow = `0 0 25px ${effectColor}40`;
    } else if (effectType === 'reset') {
      // 重置按钮：灰色简洁波纹
      ripple.style.background = `radial-gradient(circle, rgba(255,255,255,0.8) 0%, 
        ${effectColor}40 50%, transparent 80%)`;
      ripple.style.boxShadow = `0 0 15px ${effectColor}30`;
    } else if (effectType === 'category') {
      // 分类标签：彩色强烈波纹
      ripple.style.background = `radial-gradient(circle, rgba(255,255,255,1) 0%, 
        ${effectColor}60 40%, ${effectColor}30 70%, transparent 95%)`;
      ripple.style.boxShadow = `0 0 30px ${effectColor}50`;
    } else {
      // 默认：紫色渐变波纹
      ripple.style.background = `radial-gradient(circle, rgba(255,255,255,0.8) 0%, 
        ${effectColor}40 40%, ${effectColor}20 70%, transparent 95%)`;
      ripple.style.boxShadow = `0 0 20px ${effectColor}30`;
    }
    
    ripple.style.transform = 'scale(0)';
    
    // 确保按钮有相对定位
    const originalPosition = button.style.position;
    if (getComputedStyle(button).position === 'static') {
      button.style.position = 'relative';
    }
    
    button.appendChild(ripple);
    
    // 智能水波纹动画 - 根据按钮大小调整动画时长
    const rippleDuration = Math.max(400, Math.min(800, 500 + sizeMultiplier * 100));
    ripple.animate([
      { transform: 'scale(0)', opacity: 0.8 },
      { transform: 'scale(1)', opacity: 0.4 },
      { transform: 'scale(1.5)', opacity: 0 }
    ], {
      duration: rippleDuration,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    });
    
    setTimeout(() => {
      ripple.remove();
      // 恢复按钮的原始定位
      button.style.position = originalPosition;
    }, rippleDuration);
    
    // 3. 智能按钮缩放反馈 - 根据按钮类型调整缩放效果
    let scaleAmount = 0.95;
    let bounceAmount = 1.05;
    
    // 根据按钮类型调整缩放参数
    if (effectType === 'search') {
      scaleAmount = 0.92;
      bounceAmount = 1.08;
    } else if (effectType === 'reset') {
      scaleAmount = 0.93;
      bounceAmount = 1.04;
    } else if (effectType === 'category') {
      scaleAmount = 0.90;
      bounceAmount = 1.10;
    } else if (effectType === 'product') {
      scaleAmount = 0.88;
      bounceAmount = 1.12;
    }
    
    // 根据按钮大小微调缩放比例
    scaleAmount = Math.max(0.85, Math.min(0.98, scaleAmount - sizeMultiplier * 0.03));
    
    button.style.transition = 'transform 150ms ease-out';
    button.style.transform = `scale(${scaleAmount})`;
    setTimeout(() => {
      button.style.transform = `scale(${bounceAmount})`;
      setTimeout(() => {
        button.style.transform = 'scale(1)';
        setTimeout(() => {
          button.style.transition = '';
        }, 150);
      }, 75);
    }, 75);
  };

  // 创建爱心粒子效果
  const createHeartParticles = (eventIndex: number, isUnfollowing: boolean) => {
    const button = document.querySelector(`[data-event-index="${eventIndex}"]`);
    if (!button) return;
    
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // 创建粒子容器
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'fixed pointer-events-none z-50';
    particlesContainer.style.left = '0';
    particlesContainer.style.top = '0';
    particlesContainer.style.width = '100vw';
    particlesContainer.style.height = '100vh';
    
    document.body.appendChild(particlesContainer);
    
    // 创建多个粒子
    const particleCount = isUnfollowing ? 8 : 12;
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute w-2 h-2 rounded-full';
      particle.style.background = isUnfollowing ? '#9ca3af' : '#ef4444';
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;
      particle.style.transform = 'translate(-50%, -50%)';
      
      particlesContainer.appendChild(particle);
      particles.push(particle);
    }
    
    // 粒子动画
    particles.forEach((particle, index) => {
      const angle = (index / particleCount) * Math.PI * 2;
      const distance = isUnfollowing ? 40 : 80;
      const duration = isUnfollowing ? 600 : 800;
      
      const targetX = centerX + Math.cos(angle) * distance;
      const targetY = centerY + Math.sin(angle) * distance;
      
      particle.animate([
        { 
          transform: 'translate(-50%, -50%) scale(1)', 
          opacity: 1 
        },
        { 
          transform: `translate(${targetX - centerX}px, ${targetY - centerY}px) scale(0.5)`, 
          opacity: 0 
        }
      ], {
        duration: duration,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards'
      });
    });
    
    // 清理粒子容器
    setTimeout(() => {
      particlesContainer.remove();
    }, 1000);
  };

  // 创建分类按钮的爱心粒子效果
  const createHeartParticlesForCategory = (event: MouseEvent, color: string) => {
    const button = event.target as HTMLElement;
    if (!button) return;
    
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // 创建粒子容器
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'fixed pointer-events-none z-50';
    particlesContainer.style.left = '0';
    particlesContainer.style.top = '0';
    particlesContainer.style.width = '100vw';
    particlesContainer.style.height = '100vh';
    
    document.body.appendChild(particlesContainer);
    
    // 创建多个爱心粒子
    const particleCount = 8;
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute w-3 h-3';
      particle.style.background = color;
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;
      particle.style.transform = 'translate(-50%, -50%)';
      particle.style.clipPath = 'polygon(50% 15%, 61% 0, 75% 0, 85% 15%, 100% 35%, 100% 50%, 85% 65%, 75% 100%, 50% 85%, 25% 100%, 15% 65%, 0 50%, 0 35%, 15% 15%, 25% 0, 39% 0)';
      
      particlesContainer.appendChild(particle);
      particles.push(particle);
    }
    
    // 爱心粒子动画 - 向上扩散
    particles.forEach((particle, index) => {
      const angle = (index / particleCount) * Math.PI * 2;
      const distance = 60 + Math.random() * 40; // 随机距离
      const duration = 800 + Math.random() * 400; // 随机时长
      
      const targetX = centerX + Math.cos(angle) * distance;
      const targetY = centerY - Math.abs(Math.sin(angle)) * distance * 1.5; // 主要向上扩散
      
      particle.animate([
        { 
          transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', 
          opacity: 1 
        },
        { 
          transform: `translate(${targetX - centerX}px, ${targetY - centerY}px) scale(0.3) rotate(${Math.random() * 360}deg)`, 
          opacity: 0 
        }
      ], {
        duration: duration,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards'
      });
    });
    
    // 清理粒子容器
    setTimeout(() => {
      particlesContainer.remove();
    }, 1200);
  };

  // 自动轮播效果
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % heroEvents.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // 滚动监听效果 - 侧边栏与顶部导航栏绝对同步上升
  useEffect(() => {
    let ticking = false;
    
    const handleSidebarScroll = () => {
      const scrollY = window.scrollY;
      const topNavHeight = 80; // 顶部导航栏高度（5rem = 80px）
      
      // 直接使用滚动距离，确保绝对同步
      // 当滚动距离超过顶部导航栏高度时，侧边栏完全上升
      const progress = Math.min(scrollY / topNavHeight, 1);
      
      // 使用requestAnimationFrame确保丝滑
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollProgress(progress);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleSidebarScroll, { passive: true });
    
    // 初始调用一次
    handleSidebarScroll();
    
    return () => window.removeEventListener('scroll', handleSidebarScroll);
  }, []);

  const nextHero = () => {
    setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % heroEvents.length);
  };

  const prevHero = () => {
    setCurrentHeroIndex(
      (prevIndex) => (prevIndex - 1 + heroEvents.length) % heroEvents.length
    );
  };

  // 输入关键字时，自动定位到匹配的热点事件（使用防抖）
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
    }, 200);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const q = debouncedQuery;
    if (!q) return;
    const idx = heroEvents.findIndex(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
    );
    if (idx >= 0) setCurrentHeroIndex(idx);
  }, [debouncedQuery]);

  // 选择类型时，自动定位到该类型的第一个热点事件
  useEffect(() => {
    if (!selectedCategory) return;
    const idx = heroEvents.findIndex((e) => e.category === selectedCategory);
    if (idx >= 0) setCurrentHeroIndex(idx);
  }, [selectedCategory]);

  // 点击外部时关闭排序菜单
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!sortOpen) return;
      const el = sortRef.current;
      if (el && !el.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [sortOpen]);

  // 无限滚动功能
  useEffect(() => {
    const handleScroll = () => {
      // 检查是否滚动到底部
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      
      // 当距离底部小于100px时加载更多
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        // 使用totalEventsCount作为总事件数
        if (displayCount < totalEventsCount) {
          setDisplayCount(prevCount => Math.min(prevCount + 6, totalEventsCount));
        }
      }
    };

    // 添加滚动监听
    window.addEventListener('scroll', handleScroll);
    
    // 清理函数
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [displayCount, totalEventsCount]);
 
  useEffect(() => {
    const maybeCanvas = canvasRef.current;
    if (!maybeCanvas) return;
    const canvasEl = maybeCanvas;
    const context = canvasEl.getContext("2d");
    if (!context) return;
    const ctx = context;
    let animId = 0;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      constructor() {
        this.x = Math.random() * canvasEl.width;
        this.y = Math.random() * canvasEl.height;
        this.size = Math.random() * 2;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvasEl.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvasEl.height) this.speedY *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(236, 72, 153, 0.4)";
        ctx.fill();
      }
    }

    let particles: Particle[] = [];

    const resize = () => {
      canvasEl.width = window.innerWidth;
      canvasEl.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    for (let i = 0; i < 60; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  const events = [
    {
      title: "全球气候峰会",
      description: "讨论全球气候变化的应对策略",
      followers: 12842,
    },
    {
      title: "AI安全大会",
      description: "聚焦AI监管与安全问题",
      followers: 9340,
    },
    {
      title: "国际金融论坛",
      description: "探讨数字货币与未来经济",
      followers: 7561,
    },
    {
      title: "体育公益赛",
      description: "全球运动员联合助力慈善",
      followers: 5043,
    },
  ];

  // 从API获取预测事件数据
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取预测事件数据
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        // 移除limit参数，获取所有事件数据
        const response = await fetch('/api/predictions');
        const result = await response.json();
        
        if (result.success) {
          setPredictions(result.data);
          setTotalEventsCount(result.data.length);
          // 确保displayCount不超过实际数据长度
          if (result.data.length < 6) {
            setDisplayCount(result.data.length);
          }
        } else {
          setError(result.message || '获取数据失败');
        }
      } catch (err) {
        setError('网络请求失败');
        console.error('获取预测事件失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  // 将预测事件转换为页面显示格式
  const allEvents = predictions.map(prediction => ({
    title: prediction.title,
    description: prediction.description,
    insured: `${prediction.minStake} USDT`,
    minInvestment: `${prediction.minStake} USDT`,
    tag: prediction.category,
    image: prediction.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(prediction.title)}&size=400&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=20`,
    deadline: prediction.deadline,
    criteria: prediction.criteria
  }));

  // 搜索与类型筛选
  const q = searchQuery.toLowerCase().trim();
  const hasQuery = q.length > 0;
  const hasCategory = !!selectedCategory;
  const filteredHeroEvents = heroEvents.filter(
    (e) =>
      (!hasQuery ||
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)) &&
      (!hasCategory || e.category === selectedCategory)
  );
  const filteredAllEvents = allEvents.filter(
    (p) =>
      (!hasQuery ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.tag || "").toLowerCase().includes(q)) &&
      (!hasCategory || (p.tag || "") === selectedCategory)
  );
  const displayEvents = hasQuery || hasCategory ? filteredAllEvents : allEvents;
  const parseEth = (s: string) => parseFloat(String(s ?? '').replace(/[^0-9.]/g, '')) || 0;
  const sortedEvents = [...displayEvents].sort((a, b) => {
    if (sortOption === 'minInvestment-asc') {
      return parseEth(a.minInvestment) - parseEth(b.minInvestment);
    }
    if (sortOption === 'insured-desc') {
      return parseEth(b.insured) - parseEth(a.insured);
    }
    return 0;
  });

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-50 overflow-hidden text-black">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      <TopNavBar />

      {/* 集成筛选栏 - 搜索、分类筛选、排序一体化 */}
      <div className={`relative z-10 px-16 ${sidebarCollapsed ? "ml-20" : "ml-80"} mt-6`}>
        {/* 搜索栏 */}
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-purple-200 rounded-2xl px-4 py-3 shadow mb-4">
          <Search className="w-5 h-5 text-purple-600" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearchQuery(searchInput.trim());
                productsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            placeholder="输入事件关键字，定位热点事件与产品"
            className="flex-1 bg-transparent outline-none text-black placeholder:text-gray-500"
          />
          <motion.button
            type="button"
            onClick={(e) => { 
              setSearchQuery(searchInput.trim()); 
              productsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              createSmartClickEffect(e);
            }}
            className="px-3 py-1 text-sm bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-lg hover:from-pink-500 hover:to-purple-600 transition-colors relative overflow-hidden"
            aria-label="去探索"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            去探索
          </motion.button>
        </div>

        {/* 集成筛选栏 - 分类筛选 + 排序 + 重置 */}
        <div className="bg-white/90 backdrop-blur-sm border border-purple-200/60 rounded-2xl p-5 shadow-lg">
          <div className="space-y-6">
            {/* 分类筛选区域 */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-semibold text-gray-800">分类筛选：</span>
                <div className="flex flex-wrap gap-2">
                  <motion.button
                    onClick={(e) => {
                      setSelectedCategory("");
                      createSmartClickEffect(e);
                    }}
                    className={`text-sm px-4 py-2 rounded-full border-2 transition-all duration-200 font-medium relative overflow-hidden ${
                      selectedCategory === ""
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-transparent shadow-lg transform scale-105"
                        : "border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 hover:shadow-md"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    全部
                  </motion.button>
                  {Array.from(
                    new Set([
                      ...heroEvents.map((e) => e.category),
                      ...allEvents.map((p) => p.tag).filter(Boolean),
                    ])
                  ).map((cat) => {
                    // 根据分类名称设置对应的边框和文字颜色
                    let borderColor = "border-purple-300";
                    let textColor = "text-purple-700";
                    let hoverBorderColor = "hover:border-purple-400";
                    let hoverBgColor = "hover:bg-purple-50";
                    let activeGradient = "from-pink-500 to-purple-600";
                    
                    if (cat === "科技") {
                      borderColor = "border-blue-300";
                      textColor = "text-blue-700";
                      hoverBorderColor = "hover:border-blue-400";
                      hoverBgColor = "hover:bg-blue-50";
                      activeGradient = "from-blue-400 to-cyan-400";
                    } else if (cat === "娱乐") {
                      borderColor = "border-pink-300";
                      textColor = "text-pink-700";
                      hoverBorderColor = "hover:border-pink-400";
                      hoverBgColor = "hover:bg-pink-50";
                      activeGradient = "from-pink-400 to-rose-400";
                    } else if (cat === "时政") {
                      borderColor = "border-purple-300";
                      textColor = "text-purple-700";
                      hoverBorderColor = "hover:border-purple-400";
                      hoverBgColor = "hover:bg-purple-50";
                      activeGradient = "from-purple-400 to-indigo-400";
                    } else if (cat === "天气") {
                      borderColor = "border-green-300";
                      textColor = "text-green-700";
                      hoverBorderColor = "hover:border-green-400";
                      hoverBgColor = "hover:bg-green-50";
                      activeGradient = "from-green-400 to-emerald-400";
                    }
                    
                    return (
                      <motion.button
                        key={cat as string}
                        onClick={(e) => {
                          setSelectedCategory(cat as string);
                          createSmartClickEffect(e);
                        }}
                        className={`text-sm px-4 py-2 rounded-full border-2 transition-all duration-200 font-medium relative overflow-hidden ${
                          selectedCategory === cat
                            ? `bg-gradient-to-r ${activeGradient} text-white border-transparent shadow-lg transform scale-105`
                            : `${borderColor} ${textColor} ${hoverBgColor} ${hoverBorderColor} hover:shadow-md`
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {cat as string}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 排序区域 - 垂直平行放置 */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-semibold text-gray-800">排序：</span>
                <div className="flex flex-wrap gap-2">
                  <motion.button
                    onClick={(e) => {
                      setSortOption("default");
                      createSmartClickEffect(e);
                    }}
                    className={`text-sm px-4 py-2 rounded-full border-2 transition-all duration-200 font-medium relative overflow-hidden ${
                      sortOption === "default"
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-transparent shadow-lg transform scale-105"
                        : "border-pink-300 text-pink-700 hover:bg-pink-50 hover:border-pink-400 hover:shadow-md"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    默认
                  </motion.button>
                  <motion.button
                    onClick={(e) => {
                      setSortOption("minInvestment-asc");
                      createSmartClickEffect(e);
                    }}
                    className={`text-sm px-4 py-2 rounded-full border-2 transition-all duration-200 font-medium relative overflow-hidden ${
                      sortOption === "minInvestment-asc"
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-transparent shadow-lg transform scale-105"
                        : "border-pink-300 text-pink-700 hover:bg-pink-50 hover:border-pink-400 hover:shadow-md"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    起投最低(USDT)
                  </motion.button>
                  <motion.button
                    onClick={(e) => {
                      setSortOption("insured-desc");
                      createSmartClickEffect(e);
                    }}
                    className={`text-sm px-4 py-2 rounded-full border-2 transition-all duration-200 font-medium relative overflow-hidden ${
                      sortOption === "insured-desc"
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-transparent shadow-lg transform scale-105"
                        : "border-pink-300 text-pink-700 hover:bg-pink-50 hover:border-pink-400 hover:shadow-md"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    投保最多(USDT)
                  </motion.button>
                </div>
              </div>
            </div>

            {/* 右侧：重置按钮 */}
            <div className="flex items-center gap-4">
              {/* 重置按钮 */}
              <motion.button
                onClick={(e) => {
                  setSearchQuery("");
                  setSearchInput("");
                  setSelectedCategory("");
                  setSortOption("default");
                  setDisplayCount(9);
                  setSortOpen(false);
                  createSmartClickEffect(e);
                }}
                className="px-4 py-2.5 text-sm bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl border-2 border-gray-200 hover:border-gray-300 font-medium shadow-sm transition-all duration-200 relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                重置筛选
              </motion.button>
            </div>
          </div>

          {/* 筛选状态显示 */}
          {(selectedCategory || sortOption !== "default") && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 pt-4 border-t border-purple-100"
            >
              <div className="flex items-center gap-3 text-sm">
                <span className="font-medium text-gray-700">当前筛选：</span>
                <div className="flex flex-wrap gap-2">
                  {selectedCategory && (
                    <span className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 rounded-full font-medium shadow-sm">
                      📊 分类：{selectedCategory}
                    </span>
                  )}
                  {sortOption !== "default" && (
                    <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-full font-medium shadow-sm">
                      🔄 排序：{sortOption === "minInvestment-asc" ? "起投金额最低(USDT)" : "已投保最多(USDT)"}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* 搜索结果提示 */}
        {searchQuery && filteredHeroEvents.length > 0 && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {filteredHeroEvents.slice(0, 8).map((ev) => (
              <motion.button
                key={ev.title}
                onClick={(e) => {
                  const idx = heroEvents.findIndex((e) => e.title === ev.title);
                  if (idx !== -1) setCurrentHeroIndex(idx);
                  createSmartClickEffect(e);
                }}
                className="px-3 py-2 text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition-colors relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {ev.title}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* 侧边栏 */}
      <motion.div
        className={`fixed left-0 h-[calc(100vh-5rem)] bg-gradient-to-b from-white/95 to-gray-50/95 backdrop-blur-lg border-r border-gray-200/40 shadow-xl z-20 transition-all duration-500 ease-out ${
          sidebarCollapsed ? "w-20 rounded-r-2xl" : "w-80 rounded-r-3xl"
        } overflow-y-auto scrollbar-hide`}
        style={{
          top: `calc(5rem - ${scrollProgress * 5}rem)`,
          height: `calc(100vh - 5rem + ${scrollProgress * 5}rem)`
        }}
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 15 }}
      >
        {/* 侧边栏头部 */}
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <h2 className="text-xl font-bold text-black">事件导航</h2>
            )}
            <button
              onClick={(e) => {
                setSidebarCollapsed(!sidebarCollapsed);
                createSmartClickEffect(e);
              }}
              className="p-2 rounded-full bg-white/50 hover:bg-white/80 transition-all duration-300 relative overflow-hidden"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5 text-black" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-black" />
              )}
            </button>
          </div>
        </div>

        {/* 近期浏览事件 */}
        <div className="p-4">
          {!sidebarCollapsed && (
            <h3 className="text-sm font-semibold text-black mb-3 uppercase tracking-wide">
              近期浏览事件
            </h3>
          )}
          <div className="space-y-2">
            {sidebarData.recentEvents.map((event, index) => (
              <motion.div
                key={event.name}
                className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-300 hover:bg-white/50 ${
                  sidebarCollapsed ? "justify-center" : "justify-between"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">
                  <span className="text-lg">{event.icon}</span>
                  {!sidebarCollapsed && (
                    <div className="ml-3">
                      <span className="text-black font-medium block">
                        {event.name}
                      </span>
                      <span className="text-xs text-gray-600">{event.time}</span>
                    </div>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <span className="text-xs bg-purple-100 text-black px-2 py-1 rounded-full">
                    {event.category}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* 未结算事件 */}
        <div className="p-4 border-t border-gray-200/50">
          {!sidebarCollapsed && (
            <h3 className="text-sm font-semibold text-black mb-3 uppercase tracking-wide">
              未结算事件
            </h3>
          )}
          <div className="space-y-3">
            {sidebarData.trendingPredictions.map((prediction, index) => (
              <motion.div
                key={prediction.name}
                className={`flex items-center p-3 rounded-xl bg-white/30 backdrop-blur-sm cursor-pointer transition-all duration-300 ${
                  sidebarCollapsed ? "justify-center" : "justify-between"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-black" />
                  {!sidebarCollapsed && (
                    <div className="ml-3">
                      <p className="text-sm font-medium text-black">
                        {prediction.name}
                      </p>
                      <p className="text-xs text-black">{prediction.volume}</p>
                    </div>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <div
                    className={`w-2 h-2 rounded-full ${
                      prediction.trend === "up" ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* 平台数据统计 */}
        <div className="p-4 border-t border-gray-200/50">
          {!sidebarCollapsed && (
            <h3 className="text-sm font-semibold text-black mb-3 uppercase tracking-wide">
              平台数据
            </h3>
          )}
          <div className="space-y-3">
            <div
              className={`flex items-center p-3 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 ${
                sidebarCollapsed ? "justify-center" : "justify-between"
              }`}
            >
              <Shield className="w-4 h-4 text-black" />
              {!sidebarCollapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-black">总投保金额</p>
                  <p className="text-xs text-black">
                    {sidebarData.platformStats.totalInsured} USDT
                  </p>
                </div>
              )}
            </div>

            <div
              className={`flex items-center p-3 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 ${
                sidebarCollapsed ? "justify-center" : "justify-between"
              }`}
            >
              <Users className="w-4 h-4 text-black" />
              {!sidebarCollapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-black">活跃用户</p>
                  <p className="text-xs text-black">
                    {sidebarData.platformStats.activeUsers}
                  </p>
                </div>
              )}
            </div>

            <div
              className={`flex items-center p-3 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 ${
                sidebarCollapsed ? "justify-center" : "justify-between"
              }`}
            >
              <BarChart3 className="w-4 h-4 text-black" />
              {!sidebarCollapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-black">已赔付金额</p>
                  <p className="text-xs text-black">
                    {sidebarData.platformStats.claimsPaid} USDT
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="p-4 border-t border-gray-200/50 mt-auto">
          <div className="space-y-2">
            <button className="w-full flex items-center justify-center p-3 bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-xl font-medium transition-all duration-300 hover:from-pink-500 hover:to-purple-600">
              <Wallet className="w-4 h-4 mr-2" />
              {!sidebarCollapsed && "立即投保"}
            </button>
            <button className="w-full flex items-center justify-center p-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl font-medium transition-all duration-300 hover:from-purple-500 hover:to-pink-500">
              <Gift className="w-4 h-4 mr-2" />
              {!sidebarCollapsed && "领取奖励"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* 修改后的英雄区 - 轮播显示 */}
      <section
        className={`relative z-10 flex flex-col md:flex-row items-center justify-between px-16 py-20 transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-80"
        } mt-20`}
      >
        <div className="w-full md:w-1/2 mb-10 md:mb-0 relative">
          {/* 轮播图片 */}
          <div className="relative h-80 rounded-2xl shadow-xl overflow-hidden">
            {heroEvents.map((event, index) => (
              <motion.img
                key={index}
                src={event.image}
                alt={event.title}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: index === currentHeroIndex ? 1 : 0 }}
                transition={{ duration: 0.8 }}
              />
            ))}
          </div>

          {/* 轮播指示器 */}
          <div className="flex justify-center mt-4 space-x-2">
            {heroEvents.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  setCurrentHeroIndex(index);
                  createSmartClickEffect(e);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 relative overflow-hidden ${
                  index === currentHeroIndex
                    ? "bg-purple-600 w-8"
                    : "bg-purple-300 hover:bg-purple-400"
                }`}
              />
            ))}
          </div>

          {/* 轮播控制按钮 */}
          <motion.button
            onClick={(e) => {
              prevHero();
              createSmartClickEffect(e);
            }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-xl transition-all duration-300 z-20 backdrop-blur-sm border border-white/20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </motion.button>
          <motion.button
            onClick={(e) => {
              nextHero();
              createSmartClickEffect(e);
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-xl transition-all duration-300 z-20 backdrop-blur-sm border border-white/20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-5 h-5 text-gray-800" />
          </motion.button>
        </div>

        {/* 右侧专题板块 */}
        <div className="w-full md:w-1/2 pl-0 md:pl-12">
          <h2 className="text-3xl font-bold text-black mb-6 text-center md:text-left">
            热门专题
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {categories.map((category, index) => {
              const isActive =
                heroEvents[currentHeroIndex]?.category === category.name;
              const categoryEvents = allEvents.filter(
                (event) => event.tag === category.name
              );

              return (
                <motion.div
                  key={category.name}
                  className={`relative p-4 rounded-2xl shadow-lg cursor-pointer transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r " +
                        category.color +
                        " text-white scale-105"
                      : "bg-white/70 text-gray-700 hover:bg-white/90"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    // 点击专题时，切换到该专题的第一个事件，并同步类型筛选
                    setSelectedCategory(category.name);
                    const firstEventIndex = heroEvents.findIndex(
                      (event) => event.category === category.name
                    );
                    if (firstEventIndex !== -1) {
                      setCurrentHeroIndex(firstEventIndex);
                    }
                    createSmartClickEffect(e);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{category.icon}</span>
                      <div>
                        <h3 className="font-bold text-lg">{category.name}</h3>
                        <p className="text-sm opacity-80">
                          {categoryCounts[category.name] || 0}个热点
                        </p>
                      </div>
                    </div>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 bg-white rounded-full"
                      />
                    )}
                  </div>

                  {/* 当前专题的活跃事件标题 */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm font-medium"
                    >
                      {heroEvents[currentHeroIndex]?.title}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* 当前事件详情 */}
          <motion.div
            key={currentHeroIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-white/50 rounded-xl backdrop-blur-sm"
          >
            <h3 className="font-bold text-black text-lg mb-2">
              {heroEvents[currentHeroIndex]?.title}
            </h3>
            <p className="text-black text-sm mb-3">
              {heroEvents[currentHeroIndex]?.description}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-black font-bold">
                {heroEvents[currentHeroIndex]?.followers.toLocaleString()} {""}
                人关注
              </span>
              <button className="px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-full text-sm font-medium">
                立即关注
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <section
        ref={productsSectionRef}
        className={`relative z-10 px-10 py-12 bg-white/50 backdrop-blur-lg rounded-t-3xl transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-80"
        }`}
      >
        <h3 className="text-2xl font-bold text-black mb-8 text-center">
          加密货币保险产品
        </h3>
        
        {/* 加载状态 */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-black">正在加载数据...</p>
          </div>
        )}
        
        {/* 错误状态 */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-2">加载失败</div>
            <p className="text-black">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-full"
            >
              重新加载
            </button>
          </div>
        )}
        
        {/* 数据展示 */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedEvents.slice(0, displayCount).map((product, i) => (
                <motion.div
                  key={predictions[i]?.id || i}
                  className="bg-white/70 rounded-2xl shadow-md border border-white/30 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 relative"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    createSmartClickEffect(e);
                  }}
                >
                  {/* 关注按钮 */}
                  <motion.button
                    data-event-index={i}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFollow(i, e);
                    }}
                    className="absolute top-3 left-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md overflow-hidden"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    animate={followedEvents.has(i) ? "liked" : "unliked"}
                    variants={{
                      liked: { 
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        transition: { duration: 0.3 }
                      },
                      unliked: { 
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        transition: { duration: 0.3 }
                      }
                    }}
                  >
                    <motion.div
                      animate={followedEvents.has(i) ? "liked" : "unliked"}
                      variants={{
                        liked: { 
                          scale: [1, 1.2, 1],
                          transition: { 
                            duration: 0.6,
                            ease: "easeInOut"
                          }
                        },
                        unliked: { 
                          scale: 1,
                          transition: { duration: 0.3 }
                        }
                      }}
                    >
                      <Heart 
                        className={`w-5 h-5 ${
                          followedEvents.has(i) 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-gray-500'
                        }`} 
                      />
                    </motion.div>
                  </motion.button>
                  
                  {/* 产品图片 */}
                  <Link href={`/prediction/${predictions[i]?.id || i + 1}`}>
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                      />
                      {/* 标签 */}
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-pink-400 to-purple-500 text-white text-sm px-3 py-1 rounded-full">
                        {product.tag}
                      </div>
                    </div>
                  </Link>

                  {/* 产品信息 */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-black text-xl">
                        {product.title}
                      </h4>
                      <span className="text-black text-sm bg-gray-100 px-2 py-1 rounded">
                        已投保: {product.insured}
                      </span>
                    </div>

                    <p className="text-black text-sm mb-4">{product.description}</p>

                    <div className="flex justify-between items-center">
                      <p className="text-black font-bold">
                        {product.minInvestment} 起投
                      </p>
                      <Link href={`/prediction/${predictions[i]?.id || i + 1}`}>
                        <button className="px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-full text-sm font-medium hover:from-pink-500 hover:to-purple-600 transition-all duration-300 shadow-md">
                          参与事件
                        </button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* 空数据状态 */}
            {sortedEvents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-black text-lg">暂无保险产品数据</p>
              </div>
            )}
            
            {/* 加载更多提示 */}
            {displayCount < totalEventsCount && (
              <div className="text-center mt-10">
                <p className="text-black text-sm">继续下滑加载更多事件...</p>
              </div>
            )}
          </>
        )}
      </section>

      {/* 登录提示弹窗 */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-md w-full bg-gradient-to-br from-white via-white to-purple-50 rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 背景装饰 */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-2xl"></div>
              </div>
              
              {/* 弹窗内容 */}
              <div className="relative z-10 p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  请先登录
                </h3>
                <p className="text-gray-600 mb-6">
                  关注预测事件需要先连接钱包登录。请点击右上角的"连接钱包"按钮进行登录。
                </p>
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-4 mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">登录后您可以：</h4>
                  <ul className="text-gray-600 space-y-2 text-left">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      关注感兴趣的预测事件
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      参与预测和押注
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      获得预测奖励
                    </li>
                  </ul>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowLoginModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
                  >
                    稍后再说
                  </button>
                  <button
                    onClick={() => {
                      setShowLoginModal(false);
                      // 这里可以添加跳转到连接钱包页面的逻辑
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md"
                  >
                    立即登录
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer
        className={`relative z-10 text-center py-8 text-black text-sm transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-80"
        }`}
      >
        © 2025 Foresight. All rights reserved.
      </footer>

      {/* 返回顶部按钮 */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={(e) => {
              scrollToTop();
              createSmartClickEffect(e);
            }}
            className="fixed bottom-8 right-8 z-50 w-10 h-10 bg-gradient-to-br from-white/90 to-pink-100/90 rounded-full shadow-lg border border-pink-200/50 backdrop-blur-sm overflow-hidden group"
            whileHover={{ 
              scale: 1.1,
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 17 
            }}
          >
            {/* 背景质感效果 */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-pink-100/40 group-hover:from-white/60 group-hover:to-pink-100/60 transition-all duration-300"></div>
            
            {/* 箭头图标 */}
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              <div className="animate-bounce">
                <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15"/>
                </svg>
              </div>
            </div>
            
            {/* 悬浮提示 */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              返回顶部
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
