import { getDatabase } from './database';
import { supabaseAdmin } from './supabase';

// 数据迁移工具
export async function migrateDataToSupabase() {
  try {
    console.log('开始数据迁移到Supabase...');
    
    // 获取SQLite数据
    const db = getDatabase();
    
    // 迁移分类数据
    const categories = db.prepare('SELECT * FROM categories').all();
    console.log(`找到 ${categories.length} 个分类`);
    
    for (const category of categories) {
      const { error } = await supabaseAdmin
        .from('categories')
        .upsert({
          id: category.id,
          name: category.name
        }, { onConflict: 'id' });
      
      if (error) {
        console.error('分类迁移失败:', error);
      }
    }
    
    // 迁移预测事件数据
    const predictions = db.prepare('SELECT * FROM predictions').all();
    console.log(`找到 ${predictions.length} 个预测事件`);
    
    for (const prediction of predictions) {
      const { error } = await supabaseAdmin
        .from('predictions')
        .upsert({
          id: prediction.id,
          title: prediction.title,
          description: prediction.description,
          category: prediction.category,
          deadline: prediction.deadline,
          min_stake: prediction.minStake,
          criteria: prediction.criteria,
          reference_url: prediction.referenceUrl,
          status: prediction.status,
          created_at: prediction.createdAt,
          updated_at: prediction.updatedAt
        }, { onConflict: 'id' });
      
      if (error) {
        console.error('预测事件迁移失败:', error);
      }
    }
    
    // 迁移用户数据（如果有的话）
    const users = db.prepare('SELECT * FROM users').all();
    console.log(`找到 ${users.length} 个用户`);
    
    for (const user of users) {
      const { error } = await supabaseAdmin
        .from('users')
        .upsert({
          id: user.id,
          username: user.username,
          email: user.email,
          password_hash: user.password_hash,
          wallet_address: user.wallet_address,
          created_at: user.created_at,
          updated_at: user.updated_at
        }, { onConflict: 'id' });
      
      if (error) {
        console.error('用户迁移失败:', error);
      }
    }
    
    console.log('数据迁移完成！');
    
  } catch (error) {
    console.error('迁移过程中出错:', error);
  }
}

// 创建热门事件示例数据
export async function createTrendingEvents() {
  try {
    console.log('创建热门事件示例数据...');
    
    const trendingEvents = [
      {
        title: 'AI技术突破预测',
        description: '预测2025年AI技术将迎来重大突破，可能改变人类生活方式',
        category: '科技',
        image_url: '/images/ai-tech.jpg',
        followers_count: 1250
      },
      {
        title: '娱乐产业复苏',
        description: '预测2024年娱乐产业将完全复苏，票房收入创历史新高',
        category: '娱乐',
        image_url: '/images/entertainment.jpg',
        followers_count: 890
      },
      {
        title: '气候变化政策',
        description: '预测各国将在2025年推出更严格的气候变化应对政策',
        category: '时政',
        image_url: '/images/climate.jpg',
        followers_count: 2100
      },
      {
        title: '极端天气事件',
        description: '预测2024年全球极端天气事件频率将增加',
        category: '天气',
        image_url: '/images/weather.jpg',
        followers_count: 1560
      }
    ];
    
    const { error } = await supabaseAdmin
      .from('trending_events')
      .insert(trendingEvents);
    
    if (error) {
      console.error('创建热门事件失败:', error);
    } else {
      console.log('热门事件示例数据创建成功！');
    }
    
  } catch (error) {
    console.error('创建热门事件数据时出错:', error);
  }
}

// 验证数据库连接
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('数据库连接测试失败:', error);
      return false;
    }
    
    console.log('数据库连接测试成功！');
    console.log('分类数据:', data);
    return true;
    
  } catch (error) {
    console.error('连接测试出错:', error);
    return false;
  }
}