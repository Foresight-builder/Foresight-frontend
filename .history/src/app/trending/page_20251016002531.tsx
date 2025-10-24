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
} from "lucide-react";

export default function TrendingPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 侧边栏数据
  const sidebarData = {
    categories: [
      { name: "市场波动险", icon: "📊", count: 12 },
      { name: "合约安全险", icon: "🔒", count: 8 },
      { name: "交易所险", icon: "🏦", count: 6 },
      { name: "跨链风险险", icon: "🔗", count: 4 },
      { name: "NFT保护险", icon: "🖼️", count: 9 },
      { name: "质押风险险", icon: "💰", count: 7 },
    ],
    trendingProducts: [
      { name: "BTC波动险", volume: "245 ETH", trend: "up" },
      { name: "ETH智能合约险", volume: "189 ETH", trend: "up" },
      { name: "交易所安全险", volume: "320 ETH", trend: "down" },
      { name: "NFT价值险", volume: "98 ETH", trend: "up" },
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

  // 修改为加密货币保险产品数据
  const allEvents = [
    {
      title: "加密货币波动险",
      description: "针对BTC价格24小时内波动超过10%的风险保障",
      insured: "245 ETH",
      minInvestment: "0.1 ETH",
      tag: "市场波动",
      image:
        "https://p3-flow-imagex-download-sign.byteimg.com/tos-cn-i-a9rns2rl98/ae7ecd1985e14c50942ab9ce99248a48.png~tplv-a9rns2rl98-24:720:720.png?rcl=20251015141540E7CA9DB1FDBCD8B8BD20&rk3s=8e244e95&rrcfp=8a172a1a&x-expires=1761113741&x-signature=E2gCfNYp%2FC8KjcP7Qu41FRiWAqE%3D",
    },
    {
      title: "智能合约安全险",
      description: "保障因智能合约漏洞导致的资产损失",
      insured: "189 ETH",
      minInvestment: "0.05 ETH",
      tag: "合约安全",
      image: "https://picsum.photos/id/1/600/400",
    },
    {
      title: "交易所安全险",
      description: "针对交易所被黑客攻击造成的资产损失",
      insured: "320 ETH",
      minInvestment: "0.2 ETH",
      tag: "交易所风险",
      image: "https://picsum.photos/id/2/600/400",
    },
    {
      title: "跨链交易保障险",
      description: "保障跨链交易过程中可能出现的资产丢失风险",
      insured: "156 ETH",
      minInvestment: "0.08 ETH",
      tag: "跨链风险",
      image: "https://picsum.photos/id/3/600/400",
    },
    {
      title: "NFT价值保护险",
      description: "针对NFT市场价格大幅下跌的风险保障",
      insured: "98 ETH",
      minInvestment: "0.15 ETH",
      tag: "NFT市场",
      image: "https://picsum.photos/id/4/600/400",
    },
    {
      title: "质押风险保障险",
      description: "保障质押过程中可能出现的资产损失风险",
      insured: "210 ETH",
      minInvestment: "0.12 ETH",
      tag: "质押风险",
      image: "https://picsum.photos/id/5/600/400",
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-50 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      <header className="relative z-10 flex justify-between items-center px-10 py-6 backdrop-blur-xl bg-white/30 shadow-lg">
        <h1 className="text-2xl font-bold text-purple-600">Foresight</h1>
        <nav className="flex gap-8 text-gray-700 font-medium">
          <a href="#" className="hover:text-pink-500">
            首页
          </a>
          <a href="#" className="hover:text-pink-500">
            热点事件
          </a>
          <a href="#" className="hover:text-pink-500">
            数据分析
          </a>
          <a href="#" className="hover:text-pink-500">
            关于我们
          </a>
        </nav>
        <button className="px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-full shadow-md">
          连接钱包
        </button>
      </header>

      {/* 侧边栏 */}
      <motion.div
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-purple-50 to-pink-50 shadow-2xl z-20 transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-80"
        }`}
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        {/* 侧边栏头部 */}
        <div className="p-6 border-b border-purple-100">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <h2 className="text-xl font-bold text-purple-700">保险导航</h2>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-full bg-white/50 hover:bg-white/80 transition-all duration-300"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5 text-purple-600" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-purple-600" />
              )}
            </button>
          </div>
        </div>

        {/* 保险分类 */}
        <div className="p-4">
          {!sidebarCollapsed && (
            <h3 className="text-sm font-semibold text-purple-600 mb-3 uppercase tracking-wide">
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
                    <span className="ml-3 text-purple-700 font-medium">
                      {category.name}
                    </span>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
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
            <h3 className="text-sm font-semibold text-purple-600 mb-3 uppercase tracking-wide">
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
                  <TrendingUp
                    className={`w-4 h-4 ${
                      product.trend === "up" ? "text-green-500" : "text-red-500"
                    }`}
                  />
                  {!sidebarCollapsed && (
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-700">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-600">{product.volume}</p>
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
            <h3 className="text-sm font-semibold text-purple-600 mb-3 uppercase tracking-wide">
              平台数据
            </h3>
          )}
          <div className="space-y-3">
            <div
              className={`flex items-center p-3 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 ${
                sidebarCollapsed ? "justify-center" : "justify-between"
              }`}
            >
              <Shield className="w-4 h-4 text-purple-600" />
              {!sidebarCollapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-700">
                    总投保金额
                  </p>
                  <p className="text-xs text-gray-600">
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
              <Users className="w-4 h-4 text-purple-600" />
              {!sidebarCollapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-700">
                    活跃用户
                  </p>
                  <p className="text-xs text-gray-600">
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
              <BarChart3 className="w-4 h-4 text-purple-600" />
              {!sidebarCollapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-700">
                    已赔付金额
                  </p>
                  <p className="text-xs text-gray-600">
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
            <ChevronLeft className="w-6 h-6 text-purple-600" />
          </button>
          <button
            onClick={nextHero}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-300"
          >
            <ChevronRight className="w-6 h-6 text-purple-600" />
          </button>
        </div>

        {/* 右侧专题板块 */}
        <div className="w-full md:w-1/2 pl-0 md:pl-12">
          <h2 className="text-3xl font-bold text-purple-700 mb-6 text-center md:text-left">
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
                    // 点击专题时，切换到该专题的第一个事件
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
            <h3 className="font-bold text-purple-700 text-lg mb-2">
              {heroEvents[currentHeroIndex]?.title}
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              {heroEvents[currentHeroIndex]?.description}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-pink-600 font-bold">
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
        className={`relative z-10 px-10 py-12 bg-white/50 backdrop-blur-lg rounded-t-3xl transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-80"
        }`}
      >
        <h3 className="text-2xl font-bold text-purple-700 mb-8 text-center">
          加密货币保险产品
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allEvents.map((product, i) => (
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
                  <h4 className="font-bold text-purple-700 text-xl">
                    {product.title}
                  </h4>
                  <span className="text-gray-600 text-sm bg-gray-100 px-2 py-1 rounded">
                    已投保: {product.insured}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {product.description}
                </p>

                <div className="flex justify-between items-center">
                  <p className="text-pink-600 font-bold">
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
        <div className="text-center mt-10">
          <button className="px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-full font-semibold">
            查看更多
          </button>
        </div>
      </section>

      <footer
        className={`relative z-10 text-center py-8 text-gray-600 text-sm transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-80"
        }`}
      >
        © 2025 Foresight. All rights reserved.
      </footer>
    </div>
  );
}
