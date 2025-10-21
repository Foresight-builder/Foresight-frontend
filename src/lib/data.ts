// 预测事件数据模型和模拟数据

// 1. 定义预测事件的数据结构（TypeScript接口）
export interface Prediction {
  id: string;
  title: string;
  description: string;
  category: string;
  deadline: string;
  minStake: number;
  criteria: string;
  referenceUrl?: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  followers: number;
  insured?: string;
  tag?: string;
}

// 2. 创建一些初始的模拟数据（这样前端页面就有数据可以显示了）
export const mockPredictions: Prediction[] = [
  {
    id: '1',
    title: '比特币在2025年底是否突破10万美元？',
    description: '预测比特币价格在2025年12月31日前能否突破10万美元大关',
    category: '科技',
    deadline: '2025-12-31T23:59:59',
    minStake: 0.1,
    criteria: '根据CoinMarketCap官方数据，比特币价格在2025年12月31日收盘价达到或超过10万美元',
    referenceUrl: 'https://coinmarketcap.com/currencies/bitcoin/',
    status: 'active',
    createdAt: '2025-01-01T10:00:00',
    updatedAt: '2025-01-01T10:00:00',
    followers: 12842,
    insured: '245 USDT',
    tag: '加密货币'
  },
  {
    id: '2',
    title: '以太坊2.0升级是否在2025年Q1完成？',
    description: '预测以太坊2.0升级是否能在2025年第一季度顺利完成',
    category: '科技',
    deadline: '2025-03-31T23:59:59',
    minStake: 0.05,
    criteria: '以太坊基金会官方宣布2.0升级完成并主网上线',
    status: 'active',
    createdAt: '2025-01-01T09:00:00',
    updatedAt: '2025-01-01T09:00:00',
    followers: 9340,
    insured: '189 USDT',
    tag: '区块链'
  }
];

// 3. 分类数据（与前端页面保持一致）
export const categories = [
  '科技', '娱乐', '时政', '天气', '其他'
];