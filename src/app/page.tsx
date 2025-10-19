"use client";

import TopNavBar from "@/components/TopNavBar";
import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Users,
  Sparkles,
  Target,
  Coins,
  BarChart3,
  ArrowRight,
  Eye,
  Plus,
  User,
  Zap,
  Shield,
  Globe,
  Award,
} from "lucide-react";
import Link from "next/link";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type Particle = {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
    };
    let particles: Particle[] = [];
    let animId = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    const createParticle = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      color: `hsla(${Math.random() * 60 + 240}, 70%, 70%, 0.4)`,
    });

    for (let i = 0; i < 80; i++) particles.push(createParticle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  const features = [
    {
      title: "事件预测市场",
      desc: "创建事件，交易 Yes/No 份额，价格反映概率",
      icon: Target,
      color: "from-purple-400 to-indigo-400",
    },
    {
      title: "自动做市商",
      desc: "基于 CPMM 提供流动性，随时买卖无需撮合",
      icon: Zap,
      color: "from-blue-400 to-cyan-400",
    },
    {
      title: "代币化头寸",
      desc: "持仓可转让、合成或抵押，用途更灵活",
      icon: Coins,
      color: "from-green-400 to-emerald-400",
    },
    {
      title: "结算与预言机",
      desc: "采用可信预言机与治理流程进行结果结算",
      icon: Shield,
      color: "from-orange-400 to-amber-400",
    },
  ];

  const stats = [
    { label: "活跃用户", value: "10K+", icon: Users },
    { label: "预测事件", value: "500+", icon: BarChart3 },
    { label: "总交易量", value: "1M ETH", icon: TrendingUp },
    { label: "准确率", value: "85%", icon: Award },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-60"
      />

      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      <TopNavBar />

      {/* Hero Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-10 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 relative z-20"
          >
            <motion.div
              className="relative inline-flex items-center justify-center mb-6 z-30"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <img
                src="/images/logo.png"
                alt="Foresight Logo"
                className="w-20 h-20 drop-shadow-xl relative z-30"
              />
            </motion.div>
            <motion.h1 
              className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 relative z-30 leading-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ position: 'relative', zIndex: 30, lineHeight: '1.1' }}
            >
              Foresight
            </motion.h1>
            <p className="text-xl sm:text-2xl lg:text-3xl text-gray-600 max-w-4xl mx-auto mb-4 relative z-20">
              Your insight, the world's foresight.
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12 relative z-20">
              让预测更透明，让决策更聪明。基于区块链的去中心化预测市场平台
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link href="/trending">
              <button className="group bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center font-semibold text-lg">
                <Eye className="w-5 h-5 mr-2" />
                浏览市场
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/creating">
              <button className="group bg-white/80 backdrop-blur-sm border-2 border-purple-200 text-purple-600 px-8 py-4 rounded-2xl hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 flex items-center font-semibold text-lg shadow-lg">
                <Plus className="w-5 h-5 mr-2" />
                创建预测
              </button>
            </Link>
            <button className="group bg-white/80 backdrop-blur-sm border-2 border-green-200 text-green-600 px-8 py-4 rounded-2xl hover:bg-green-50 hover:border-green-300 transition-all duration-300 flex items-center font-semibold text-lg shadow-lg">
              <User className="w-5 h-5 mr-2" />
              我的预测
            </button>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mb-4 mx-auto">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              核心功能
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              基于区块链技术的去中心化预测市场，为您提供透明、公正的预测交易体验
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-12 shadow-2xl"
          >
            <div className="flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-8 mx-auto">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              准备好开始预测了吗？
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              加入我们的社区，用您的洞察力参与全球预测市场，获得丰厚回报
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/creating">
                <button className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg">
                  立即创建预测
                </button>
              </Link>
              <Link href="/trending">
                <button className="border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/10 transition-colors">
                  探索热门预测
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-white/80 backdrop-blur-sm border-t border-gray-200/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <img
                src="/images/logo.png"
                alt="Foresight Logo"
                className="w-10 h-10 drop-shadow-sm mr-3"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Foresight
              </span>
            </div>
            <p className="text-gray-600 mb-4">
              © 2025 Foresight 预测市场 | 用交易表达信念，价格反映概率
            </p>
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Target className="w-4 h-4 mr-2" />
              让预测更透明，让决策更聪明
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
