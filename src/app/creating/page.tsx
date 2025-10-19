"use client";
import React, { useState } from "react";
import TopNavBar from "@/components/TopNavBar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  FileText,
  Tags,
  Coins,
  Link as LinkIcon,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Users,
  Clock,
  AlertCircle,
  Info,
  Eye,
  Save,
  Zap,
} from "lucide-react";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const categories = [
    { value: "科技", icon: "💻", color: "from-blue-400 to-cyan-400" },
    { value: "娱乐", icon: "🎬", color: "from-pink-400 to-rose-400" },
    { value: "时政", icon: "🏛️", color: "from-purple-400 to-indigo-400" },
    { value: "天气", icon: "🌤️", color: "from-green-400 to-emerald-400" },
    { value: "其他", icon: "🔮", color: "from-orange-400 to-amber-400" },
  ];

  // 计算最小可选日期（一周后）
  const getMinDateTime = () => {
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    return oneWeekFromNow.toISOString().slice(0, 16); // 格式化为 datetime-local 格式
  };

  const validate = () => {
    const e: { [k: string]: string } = {};
    if (!title.trim()) e.title = "请填写事件标题";
    if (title.length > 100) e.title = "标题不能超过100个字符";
    if (!description.trim()) e.description = "请填写事件描述";
    if (description.length > 500) e.description = "描述不能超过500个字符";
    if (!deadline) e.deadline = "请选择截止时间";
    
    // 检查截止时间限制
    if (deadline) {
      const selectedDate = new Date(deadline);
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      if (selectedDate <= now) {
        e.deadline = "截止时间不能是过去的时间";
      } else if (selectedDate <= oneWeekFromNow) {
        e.deadline = "截止时间必须在一周之后";
      }
    }
    
    if (!criteria.trim()) e.criteria = "请填写结算条件";
    if (criteria.length > 300) e.criteria = "结算条件不能超过300个字符";
    if (Number(minStake) <= 0) e.minStake = "最小押注需大于 0";
    if (Number(minStake) > 10) e.minStake = "最小押注不能超过 10 ETH";
    if (referenceUrl && !isValidUrl(referenceUrl))
      e.referenceUrl = "请输入有效的URL";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          category,
          deadline,
          minStake: parseFloat(minStake),
          criteria,
          referenceUrl: referenceUrl || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCreated(true);
        // 清空表单
        setTitle("");
        setDescription("");
        setCategory("科技");
        setDeadline("");
        setMinStake("0.1");
        setCriteria("");
        setReferenceUrl("");
        setErrors({});

        setTimeout(() => setCreated(false), 3000);
      } else {
        setErrors({ submit: result.message || "创建失败" });
      }
    } catch (error) {
      console.error("创建预测事件失败:", error);
      setErrors({ submit: "网络请求失败，请稍后重试" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentCategory = () =>
    categories.find((c) => c.value === category) || categories[0];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
      <TopNavBar />

      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
      </div>

      <section className="relative z-10 px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            创建预测事件
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            发起一个有趣的预测事件，让社区成员参与预测并获得奖励
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-7xl mx-auto"
        >
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* 左侧：表单 */}
            <div className="xl:col-span-2">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">
                      事件详情
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="xl:hidden flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {showPreview ? "隐藏预览" : "显示预览"}
                  </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                  {/* 标题输入 */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <FileText className="w-4 h-4 mr-2 text-purple-500" />
                      事件标题
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="例如：比特币在 2025 年底是否突破 10 万美元？"
                        className={`w-full px-4 py-3 rounded-xl border-2 bg-white/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-0 placeholder:text-gray-400 text-gray-900 ${
                          errors.title
                            ? "border-red-300 focus:border-red-400"
                            : "border-gray-200 focus:border-purple-400"
                        }`}
                        maxLength={100}
                      />
                      <div className="absolute right-3 top-3 text-xs text-gray-400">
                        {title.length}/100
                      </div>
                    </div>
                    <AnimatePresence>
                      {errors.title && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-sm text-red-600 flex items-center"
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.title}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 描述输入 */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <FileText className="w-4 h-4 mr-2 text-purple-500" />
                      事件描述
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        placeholder="请详细描述事件背景、参与方式、可能影响因素等，让参与者更好地理解事件"
                        className={`w-full px-4 py-3 rounded-xl border-2 bg-white/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-0 resize-none placeholder:text-gray-400 text-gray-900 ${
                          errors.description
                            ? "border-red-300 focus:border-red-400"
                            : "border-gray-200 focus:border-purple-400"
                        }`}
                        maxLength={500}
                      />
                      <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                        {description.length}/500
                      </div>
                    </div>
                    <AnimatePresence>
                      {errors.description && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-sm text-red-600 flex items-center"
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 分类和截止时间 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-black">
                        <Tags className="w-4 h-4 mr-2 text-purple-500" />
                        事件分类
                      </label>
                      <div className="relative">
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:border-purple-400 transition-all duration-200 appearance-none cursor-pointer text-black"
                        >
                          {categories.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.icon} {c.value}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-black">
                        <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                        截止时间
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        min={getMinDateTime()}
                        className={`w-full px-4 py-3 rounded-xl border-2 bg-white/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-0 text-black ${
                          errors.deadline
                            ? "border-red-300 focus:border-red-400"
                            : "border-gray-200 focus:border-purple-400"
                        }`}
                      />
                      <p className="text-xs text-gray-500 flex items-center">
                        <Info className="w-3 h-3 mr-1" />
                        只能选择未来一周后的时间
                      </p>
                      <AnimatePresence>
                        {errors.deadline && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-sm text-red-600 flex items-center"
                          >
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.deadline}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* 最小押注和参考链接 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700">
                        <Coins className="w-4 h-4 mr-2 text-purple-500" />
                        最小押注 (ETH)
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        max="10"
                        value={minStake}
                        onChange={(e) => setMinStake(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 bg-white/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-0 text-gray-900 ${
                          errors.minStake
                            ? "border-red-300 focus:border-red-400"
                            : "border-gray-200 focus:border-purple-400"
                        }`}
                      />
                      <AnimatePresence>
                        {errors.minStake && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-sm text-red-600 flex items-center"
                          >
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.minStake}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700">
                        <LinkIcon className="w-4 h-4 mr-2 text-purple-500" />
                        参考链接 (可选)
                      </label>
                      <input
                        type="url"
                        value={referenceUrl}
                        onChange={(e) => setReferenceUrl(e.target.value)}
                        placeholder="例如：新闻源或数据网站链接"
                        className={`w-full px-4 py-3 rounded-xl border-2 bg-white/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-0 placeholder:text-gray-400 text-gray-900 ${
                          errors.referenceUrl
                            ? "border-red-300 focus:border-red-400"
                            : "border-gray-200 focus:border-purple-400"
                        }`}
                      />
                      <AnimatePresence>
                        {errors.referenceUrl && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-sm text-red-600 flex items-center"
                          >
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.referenceUrl}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* 结算条件 */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <CheckCircle className="w-4 h-4 mr-2 text-purple-500" />
                      结算条件
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        value={criteria}
                        onChange={(e) => setCriteria(e.target.value)}
                        rows={3}
                        placeholder="明确事件被判定为'达成/未达成'的客观条件，例如：2025年12月31日前，比特币价格达到或超过10万美元"
                        className={`w-full px-4 py-3 rounded-xl border-2 bg-white/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-0 resize-none placeholder:text-gray-400 text-gray-900 ${
                          errors.criteria
                            ? "border-red-300 focus:border-red-400"
                            : "border-gray-200 focus:border-purple-400"
                        }`}
                        maxLength={300}
                      />
                      <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                        {criteria.length}/300
                      </div>
                    </div>
                    <AnimatePresence>
                      {errors.criteria && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-sm text-red-600 flex items-center"
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.criteria}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 提交错误显示 */}
                  <AnimatePresence>
                    {errors.submit && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center"
                      >
                        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                        {errors.submit}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 提交按钮 */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                    <motion.button
                      type="submit"
                      disabled={isSubmitting || created}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          创建中...
                        </>
                      ) : created ? (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          创建成功
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          创建事件
                        </>
                      )}
                    </motion.button>

                    <div className="flex items-center text-sm text-gray-500">
                      <Info className="w-4 h-4 mr-1" />
                      <span>提交后将保存到数据库并显示在趋势页面</span>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* 右侧：实时预览 */}
            <AnimatePresence>
              {(showPreview || window.innerWidth >= 1280) && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="xl:col-span-1"
                >
                  <div className="sticky top-8">
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">
                          实时预览
                        </h2>
                      </div>

                      <motion.div
                        layout
                        className="rounded-2xl overflow-hidden shadow-lg border border-gray-100"
                      >
                        {/* 预览卡片头部 */}
                        <div
                          className={`p-4 bg-gradient-to-r ${
                            getCurrentCategory().color
                          } text-white relative overflow-hidden`}
                        >
                          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                          <div className="relative z-10">
                            <div className="flex items-center mb-2">
                              <span className="text-2xl mr-2">
                                {getCurrentCategory().icon}
                              </span>
                              <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
                                {category}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold leading-tight">
                              {title || "填写一个有吸引力的标题"}
                            </h3>
                          </div>
                        </div>

                        {/* 预览卡片内容 */}
                        <div className="p-4 bg-white">
                          <p className="text-sm text-gray-700 leading-relaxed mb-4 whitespace-pre-line">
                            {description ||
                              "描述事件背景与参与规则，让更多人理解并参与预测。"}
                          </p>

                          {/* 预览统计信息 */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="flex items-center text-sm text-black">
                              <Clock className="w-4 h-4 mr-2 text-orange-500" />
                              <span className="truncate">
                                {deadline
                                  ? new Date(deadline).toLocaleDateString(
                                      "zh-CN"
                                    )
                                  : "未选择"}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-black">
                              <Coins className="w-4 h-4 mr-2 text-yellow-500" />
                              <span>{minStake} ETH</span>
                            </div>
                          </div>

                          {/* 结算条件 */}
                          <div className="p-3 bg-gray-50 rounded-lg mb-4">
                            <div className="flex items-center mb-1">
                              <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                              <span className="text-xs font-medium text-gray-600">
                                结算条件
                              </span>
                            </div>
                            <p className="text-xs text-gray-700 leading-relaxed">
                              {criteria || "请明确结算条件"}
                            </p>
                          </div>

                          {/* 参考链接 */}
                          {referenceUrl && (
                            <a
                              href={referenceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-xs text-purple-600 hover:text-purple-700 transition-colors"
                            >
                              <LinkIcon className="w-3 h-3 mr-1" />
                              参考链接
                            </a>
                          )}

                          {/* 模拟参与按钮 */}
                          <div className="flex gap-2 mt-4">
                            <button className="flex-1 py-2 px-3 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors">
                              支持 (预测达成)
                            </button>
                            <button className="flex-1 py-2 px-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
                              反对 (预测不达成)
                            </button>
                          </div>
                        </div>
                      </motion.div>

                      {/* 成功提示 */}
                      <AnimatePresence>
                        {created && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="mt-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center"
                          >
                            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                            <div>
                              <div className="font-medium">创建成功！</div>
                              <div className="text-xs mt-1 opacity-80">
                                预测事件已保存，可在趋势页面查看
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* 页脚 */}
      <footer className="relative z-10 text-center py-8 text-gray-500 text-sm">
        <div className="flex items-center justify-center mb-2">
          <Sparkles className="w-4 h-4 mr-2" />
          <span>© 2025 Foresight - 预见未来，智慧预测</span>
        </div>
      </footer>
    </div>
  );
}
