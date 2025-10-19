// 分类API路由 - 处理GET请求
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function GET() {
  try {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM categories ORDER BY name');
    const categories = stmt.all();
    
    // 返回分类列表
    return NextResponse.json({
      success: true,
      data: categories,
      message: '获取分类列表成功'
    });
    
  } catch (error) {
    // 错误处理
    console.error('获取分类列表失败:', error);
    return NextResponse.json(
      { success: false, message: '获取分类列表失败' },
      { status: 500 }
    );
  }
}