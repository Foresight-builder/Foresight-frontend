"use client";
import React, { useState } from "react";
import TopNavBar from "@/components/TopNavBar";
import { motion } from "framer-motion";
import { Calendar, FileText, Tags, Coins, Link as LinkIcon, CheckCircle, Sparkles } from "lucide-react";

export default function CreatingPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("科技");
  const [deadline, setDeadline] = useState("");
  const [minStake, setMinStake] = useState("0.1");
  const [criteria, setCriteria] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [created, setCreated] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const categories = ["科技", "娱乐", "时政", "天气", "其他"]; // 与站内一致的风格

  const validate = () => {
    const e: { [k: string]: string } = {};
    if (!title.trim()) e.title = "请填写事件标题";
    if (!description.trim()) e.description = "请填写事件描述";
    if (!deadline) e.deadline = "请选择截止时间";
    if (!criteria.trim()) e.criteria = "请填写结算条件";
    if (Number(minStake) <= 0) e.minStake = "最小押注需大于 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setCreated(true);
    setTimeout(() => setCreated(false), 2500);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-50 overflow-hidden text-black">
      <TopNavBar />

      <section className="relative z-10 px-10 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* 左侧：表单 */}
          <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-md shadow-xl">
            <div className="flex items-center mb-4">
              <Sparkles className="w-5 h-5 mr-2" />
              <h2 className="text-xl font-bold">创建预测事件</h2>
            </div>
            <p className="text-sm mb-6 opacity-80">
              描述你想要广大用户参与的预测事件，设定截止时间与结算条件。
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="flex items-center text-sm font-medium mb-1">
                  <FileText className="w-4 h-4 mr-2" /> 标题
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：比特币在 2025 年底是否突破 10 万美元？"
                  className="w-full px-3 py-2 rounded-lg border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="flex items-center text-sm font-medium mb-1">
                  <FileText className="w-4 h-4 mr-2" /> 描述
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="请简要描述事件背景、参与方式、可能影响因素等"
                  className="w-full px-3 py-2 rounded-lg border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-600">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-sm font-medium mb-1">
                    <Tags className="w-4 h-4 mr-2" /> 分类
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium mb-1">
                    <Calendar className="w-4 h-4 mr-2" /> 截止时间
                  </label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                  {errors.deadline && (
                    <p className="mt-1 text-xs text-red-600">{errors.deadline}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-sm font-medium mb-1">
                    <Coins className="w-4 h-4 mr-2" /> 最小押注（ETH）
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={minStake}
                    onChange={(e) => setMinStake(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                  {errors.minStake && (
                    <p className="mt-1 text-xs text-red-600">{errors.minStake}</p>
                  )}
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium mb-1">
                    <LinkIcon className="w-4 h-4 mr-2" /> 参考链接（可选）
                  </label>
                  <input
                    type="url"
                    value={referenceUrl}
                    onChange={(e) => setReferenceUrl(e.target.value)}
                    placeholder="例如：新闻源或数据网站链接"
                    className="w-full px-3 py-2 rounded-lg border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center text-sm font-medium mb-1">
                  <CheckCircle className="w-4 h-4 mr-2" /> 结算条件
                </label>
                <textarea
                  value={criteria}
                  onChange={(e) => setCriteria(e.target.value)}
                  rows={3}
                  placeholder="明确事件被判定为“达成/未达成”的客观条件，例如：某日期前官方发布的统计数据达到 X"
                  className="w-full px-3 py-2 rounded-lg border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                {errors.criteria && (
                  <p className="mt-1 text-xs text-red-600">{errors.criteria}</p>
                )}
              </div>

              <div className="flex items-center justify-between mt-6">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold hover:from-pink-500 hover:to-purple-600 transition-all"
                >
                  创建事件
                </button>
                <span className="text-xs opacity-70">提交后会在页面内展示预览（示例）。</span>
              </div>
            </form>
          </div>

          {/* 右侧：实时预览 */}
          <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-md shadow-xl">
            <div className="flex items-center mb-4">
              <Sparkles className="w-5 h-5 mr-2" />
              <h2 className="text-xl font-bold">事件预览</h2>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl overflow-hidden shadow-lg"
            >
              <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100">
                <h3 className="text-lg font-bold">{title || "填写一个有吸引力的标题"}</h3>
                <p className="text-sm mt-1 opacity-80">分类：{category}</p>
              </div>
              <div className="p-4 bg-white">
                <p className="text-sm whitespace-pre-line">
                  {description || "描述事件背景与参与规则，让更多人理解并参与。"}
                </p>
                <div className="mt-3 text-sm">
                  <span className="inline-block mr-4">截止：{deadline || "未选择"}</span>
                  <span className="inline-block">最小押注：{minStake} ETH</span>
                </div>
                <div className="mt-3 text-xs opacity-80">
                  结算条件：{criteria || "请明确结算条件"}
                </div>
                {referenceUrl && (
                  <a
                    href={referenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-xs underline"
                  >
                    参考链接
                  </a>
                )}
              </div>
            </motion.div>

            {created && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-lg bg-green-100 text-sm"
              >
                已创建（示例）！当前为前端演示，实际提交需对接后端或智能合约。
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      <footer className="relative z-10 text-center py-8 text-black text-sm">
        © 2025 Foresight. Creating.
      </footer>
    </div>
  );
}