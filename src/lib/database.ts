import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// 数据库文件路径
const dbPath = path.join(process.cwd(), 'data', 'predictions.db');

// 确保data目录存在
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 创建数据库连接
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    
    // 启用外键约束
    db.pragma('foreign_keys = ON');
    
    // 创建预测事件表
    db.exec(`
      CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        deadline TEXT NOT NULL,
        minStake REAL NOT NULL,
        criteria TEXT NOT NULL,
        referenceUrl TEXT DEFAULT '',
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled')),
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 创建分类表
    db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      )
    `);
    
    // 插入默认分类数据
    const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
    const defaultCategories = ['科技', '娱乐', '时政', '天气', '其他'];
    defaultCategories.forEach(category => {
      insertCategory.run(category);
    });
    

    
    // 创建押注记录表
    db.exec(`
      CREATE TABLE IF NOT EXISTS bets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        prediction_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        outcome TEXT NOT NULL CHECK(outcome IN ('yes', 'no')),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (prediction_id) REFERENCES predictions (id) ON DELETE CASCADE
      )
    `);
    
    // 插入一些示例预测事件
    const insertPrediction = db.prepare(`
      INSERT OR IGNORE INTO predictions 
      (title, description, category, deadline, minStake, criteria, referenceUrl, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const examplePredictions = [
      {
        title: "比特币在2025年底是否突破10万美元？",
        description: "预测比特币价格在2025年12月31日前是否达到或超过10万美元",
        category: "科技",
        deadline: "2025-12-31T23:59:59",
        minStake: 1,
        criteria: "根据CoinMarketCap官方数据，比特币价格在2025年12月31日23:59:59前达到或超过10万美元",
        referenceUrl: "https://coinmarketcap.com/currencies/bitcoin/",
        status: "active"
      },
      {
        title: "2024年全球平均气温是否创历史新高？",
        description: "预测2024年全球平均气温是否超过历史最高记录",
        category: "天气",
        deadline: "2024-12-31T23:59:59",
        minStake: 1,
        criteria: "根据世界气象组织发布的2024年全球平均气温数据，是否超过2023年的记录",
        referenceUrl: "https://public.wmo.int/",
        status: "active"
      }
    ];
    
    examplePredictions.forEach(prediction => {
      insertPrediction.run(
        prediction.title,
        prediction.description,
        prediction.category,
        prediction.deadline,
        prediction.minStake,
        prediction.criteria,
        prediction.referenceUrl,
        prediction.status
      );
    });
  }
  
  return db;
}

// 关闭数据库连接（用于清理）
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

// 数据库操作类型定义
export interface Prediction {
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
}

export interface Category {
  id: number;
  name: string;
}



export interface Bet {
  id: number;
  user_id: number;
  prediction_id: number;
  amount: number;
  outcome: 'yes' | 'no';
  created_at: string;
}