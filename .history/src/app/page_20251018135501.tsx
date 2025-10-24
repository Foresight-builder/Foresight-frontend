"use client";

import TopNavBar from "@/components/TopNavBar";
import React, { useEffect, useRef } from "react";

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
      color: `hsla(${Math.random() * 360}, 80%, 80%, 0.6)`,
    });

    for (let i = 0; i < 120; i++) particles.push(createParticle());

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

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-100 via-purple-100 to-pink-50 text-gray-800">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      ></canvas>

      <TopNavBar />

      <section className="relative z-10 text-center py-24 px-6">
        <div className="flex flex-col items-center">
          <img src="/images/logo.png" alt="logo" className="w-30 h-30" />
          <h2 className="text-5xl font-extrabold text-purple-700 mb-4">
            Foresight
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mb-8">
            Your insight,
            <br />
            the world's forsight.
          </p>
          <div className="flex space-x-4">
            <button className="bg-gradient-to-r from-pink-400 to-purple-500 text-white px-6 py-3 rounded-xl shadow hover:opacity-90">
              开始捐赠
            </button>
            <button className="border border-purple-400 text-purple-600 px-6 py-3 rounded-xl hover:bg-purple-50">
              批量捐赠
            </button>
            <button className="border border-green-400 text-green-600 px-6 py-3 rounded-xl hover:bg-green-50">
              爱心广场
            </button>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-16 bg-white/60 backdrop-blur-sm">
        <h3 className="text-3xl font-bold text-center mb-10 text-purple-700">
          平台特色
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-10">
          {[
            {
              title: "去中心化透明",
              desc: "基于智能合约，所有交易公开透明、无法篡改",
              icon: "🛡",
            },
            {
              title: "资金可追溯",
              desc: "每笔捐款都有链上记录，确保善款去向清晰",
              icon: "👁️",
            },
            {
              title: "直接援助",
              desc: "捐款直达受益人，无中间环节",
              icon: "🤝",
            },
            {
              title: "实时统计",
              desc: "随时查看进度与资金使用情况",
              icon: "📊",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition"
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <h4 className="font-bold text-purple-700 mb-2">{item.title}</h4>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 text-center py-6 text-gray-500 bg-white/50">
        © 2025 Foresight 慈善平台 | 爱与信任，让未来更光明 💖
      </footer>
    </div>
  );
}
