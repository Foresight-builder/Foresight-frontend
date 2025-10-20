"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import TopNavBar from "@/components/TopNavBar";
import Link from "next/link";

export default function TrendingPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 侧边栏数据
  const sidebarData = {
    categories: [
      { name: "跨链风险险", icon: "🔗", count: 4 },
      { name: "NFT保护险", icon: "🖼️", count: 9 },
      { name: "质押风险险", icon: "💰", count: 7 },
      { name: "稳定币风险险", icon: "💵", count: 5 },
      { name: "去中心化协议险", icon: "⚙️", count: 7 },
      { name: "隐私协议险", icon: "🕵️", count: 3 },
      { name: "预言机风险险", icon: "🔮", count: 2 },
    ],
    trendingProducts: [
      { name: "BTC波动险", volume: "245 ETH", trend: "up" },
      { name: "ETH智能合约险", volume: "189 ETH", trend: "up" },
      { name: "交易所安全险", volume: "320 ETH", trend: "down" },
      { name: "稳定币脱锚险", volume: "150 ETH", trend: "down" },
      { name: "跨链桥安全险", volume: "210 ETH", trend: "up" },
      { name: "去中心化协议险", volume: "133 ETH", trend: "up" },
    ],
    platformStats: {
      totalInsured: "1,208 ETH",
      activeUsers: "2,456",
      claimsPaid: "89 ETH",
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
    { name: "科技", icon: "🚀", color: "from-blue-400 to-blue-600" },
    { name: "娱乐", icon: "🎬", color: "from-pink-400 to-pink-600" },
    { name: "时政", icon: "🏛️", color: "from-purple-400 to-purple-600" },
    { name: "天气", icon: "🌤️", color: "from-cyan-400 to-cyan-600" },
  ];

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortOption, setSortOption] = useState<"default" | "minInvestment-asc" | "insured-desc">("default");
  const [displayCount, setDisplayCount] = useState(9);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement | null>(null);
  const productsSectionRef = useRef<HTMLElement | null>(null);

  // 自动轮播效果
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % heroEvents.length);
    }, 4000);
    return () => clearInterval(interval);
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
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [sortOpen]);
 
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
        const response = await fetch('/api/predictions?limit=10');
        const result = await response.json();
        
        if (result.success) {
          setPredictions(result.data);
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
    insured: `${prediction.minStake} ETH`,
    minInvestment: `${prediction.minStake} ETH`,
    tag: prediction.category,
    image: "https://picsum.photos/id/" + (Math.floor(Math.random() * 10) + 1) + "/600/400",
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

      {/* 搜索热点事件与产品 */}
      <div className={`relative z-10 px-16 ${sidebarCollapsed ? "ml-20" : "ml-80"} mt-6`}>
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-purple-200 rounded-2xl px-4 py-3 shadow">
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
          <button
            type="button"
            onClick={() => { setSearchQuery(searchInput.trim()); productsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
            className="px-3 py-1 text-sm bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-lg hover:from-pink-500 hover:to-purple-600 transition-colors"
            aria-label="去探索"
          >
            去探索
          </button>
          {/* 将排序和重置移至下方筛选栏 */}
        </div>
        {/* 已移除：排序下拉与重置按钮，统一到筛选栏右侧 */}

        {searchQuery && filteredHeroEvents.length > 0 && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {filteredHeroEvents.slice(0, 8).map((ev) => (
              <button
                key={ev.title}
                onClick={() => {
                  const idx = heroEvents.findIndex((e) => e.title === ev.title);
                  if (idx !== -1) setCurrentHeroIndex(idx);
                }}
                className="px-3 py-2 text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition-colors"
              >
                {ev.title}
              </button>
            ))}
          </div>
        )}

        {/* 类型筛选 */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-600">筛选类型：</span>
            <button
              onClick={() => setSelectedCategory("")}
              className={`text-sm px-3 py-1 rounded-full border transition-all ${
                selectedCategory === ""
                  ? "bg-gradient-to-r from-pink-400 to-purple-500 text-white border-transparent"
                  : "border-purple-300 text-purple-700 hover:bg-purple-50"
              }`}
            >
              全部
            </button>
            {Array.from(
              new Set([
                ...heroEvents.map((e) => e.category),
                ...allEvents.map((p) => p.tag).filter(Boolean),
              ])
            ).map((cat) => (
              <button
                key={cat as string}
                onClick={() => setSelectedCategory(cat as string)}
                className={`text-sm px-3 py-1 rounded-full border transition-all ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-pink-400 to-purple-500 text-white border-transparent"
                    : "border-purple-300 text-purple-700 hover:bg-purple-50"
                }`}
              >
                {cat as string}
              </button>
            ))}

            {/* 排序与重置控件移至筛选栏右侧 */}
            <div className="ml-auto flex items-center gap-2">
              <div ref={sortRef} className="relative">
                <button
                  type="button"
                  onClick={() => setSortOpen((v) => !v)}
                  className="flex items-center gap-2 text-sm bg-white border border-purple-200 rounded-lg px-2 py-1 text-black hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  aria-haspopup="listbox"
                  aria-expanded={sortOpen}
                >
                  <span>
                    {sortOption === "default"
                      ? "排序：默认"
                      : sortOption === "minInvestment-asc"
                      ? "起投金额最低"
                      : "已投保最多"}
                  </span>
                  <ChevronsUpDown className="w-4 h-4 text-purple-600" />
                </button>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute left-0 mt-2 w-44 bg-white border border-purple-200 rounded-xl shadow-lg overflow-hidden z-50"
                    role="listbox"
                  >
                    {[
                      { value: "default", label: "排序：默认" },
                      { value: "minInvestment-asc", label: "起投金额最低" },
                      { value: "insured-desc", label: "已投保最多" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onMouseDown={() => {
                          setSortOption(opt.value as any);
                          setSortOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-purple-50 ${
                          sortOption === opt.value ? "bg-purple-50 text-purple-700" : "text-black"
                        }`}
                        role="option"
                        tabIndex={0}
                        aria-selected={sortOption === opt.value}
                      >
                        <span>{opt.label}</span>
                        {sortOption === opt.value && (
                          <Check className="w-4 h-4 text-purple-600" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchInput("");
                  setSelectedCategory("");
                  setSortOption("default");
                  setDisplayCount(9);
                  setSortOpen(false);
                }}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                重置筛选
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 侧边栏 */}
      <motion.div
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-purple-50 to-pink-50 shadow-2xl z-20 transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-80"
        } overflow-y-auto`}
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        {/* 侧边栏头部 */}
        <div className="p-6 border-b border-purple-100">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <h2 className="text-xl font-bold text-black">保险导航</h2>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-full bg-white/50 hover:bg-white/80 transition-all duration-300"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5 text-black" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-black" />
              )}
            </button>
          </div>
        </div>

        {/* 保险分类 */}
        <div className="p-4">
          {!sidebarCollapsed && (
            <h3 className="text-sm font-semibold text-black mb-3 uppercase tracking-wide">
              保险分类
            </h3>
          )}
          <div className="space-y-2">
            {sidebarData.categories.map((category, index) => (
              <motion.div
                key={category.name}
                className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-300 hover:bg-white/50 ${
                  sidebarCollapsed ? "justify-center" : "justify-between"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">
                  <span className="text-lg">{category.icon}</span>
                  {!sidebarCollapsed && (
                    <span className="ml-3 text-black font-medium">
                      {category.name}
                    </span>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <span className="text-xs bg-purple-100 text-black px-2 py-1 rounded-full">
                    {category.count}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* 热门保险产品 */}
        <div className="p-4 border-t border-purple-100">
          {!sidebarCollapsed && (
            <h3 className="text-sm font-semibold text-black mb-3 uppercase tracking-wide">
              热门产品
            </h3>
          )}
          <div className="space-y-3">
            {sidebarData.trendingProducts.map((product, index) => (
              <motion.div
                key={product.name}
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
                        {product.name}
                      </p>
                      <p className="text-xs text-black">{product.volume}</p>
                    </div>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <div
                    className={`w-2 h-2 rounded-full ${
                      product.trend === "up" ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* 平台数据统计 */}
        <div className="p-4 border-t border-purple-100">
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
                    {sidebarData.platformStats.totalInsured}
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
                    {sidebarData.platformStats.claimsPaid}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="p-4 border-t border-purple-100 mt-auto">
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
        }`}
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
                onClick={() => setCurrentHeroIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentHeroIndex
                    ? "bg-purple-600 w-8"
                    : "bg-purple-300 hover:bg-purple-400"
                }`}
              />
            ))}
          </div>

          {/* 轮播控制按钮 */}
          <button
            onClick={prevHero}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-300"
          >
            <ChevronLeft className="w-6 h-6 text-black" />
          </button>
          <button
            onClick={nextHero}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-300"
          >
            <ChevronRight className="w-6 h-6 text-black" />
          </button>
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
              const categoryEvents = heroEvents.filter(
                (event) => event.category === category.name
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
                  onClick={() => {
                    // 点击专题时，切换到该专题的第一个事件，并同步类型筛选
                    setSelectedCategory(category.name);
                    const firstEventIndex = heroEvents.findIndex(
                      (event) => event.category === category.name
                    );
                    if (firstEventIndex !== -1) {
                      setCurrentHeroIndex(firstEventIndex);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{category.icon}</span>
                      <div>
                        <h3 className="font-bold text-lg">{category.name}</h3>
                        <p className="text-sm opacity-80">
                          {categoryEvents.length}个热点
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
                <div
                  key={i}
                  className="bg-white/70 rounded-2xl shadow-md border border-white/30 overflow-hidden"
                >
                  {/* 产品图片 */}
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
                      <button className="px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-full text-sm font-medium hover:from-pink-500 hover:to-purple-600 transition-all duration-300 shadow-md">
                        立即投保
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 空数据状态 */}
            {sortedEvents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-black text-lg">暂无保险产品数据</p>
              </div>
            )}
            
            {sortedEvents.length > displayCount && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setDisplayCount((c) => Math.min(c + 9, sortedEvents.length))}
                  className="px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-full font-semibold"
                >
                  查看更多
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <footer
        className={`relative z-10 text-center py-8 text-black text-sm transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-80"
        }`}
      >
        © 2025 Foresight. All rights reserved.
      </footer>
    </div>
  );
}
