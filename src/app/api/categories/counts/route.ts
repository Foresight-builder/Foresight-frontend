// 分类热点数量API路由 - 获取每个分类的预测事件数量
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { mockPredictions } from '@/lib/data';

export async function GET() {
  try {
    // 使用Supabase查询每个分类的预测事件数量（只统计活跃状态的事件）
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from('categories')
      .select('name');
    
    if (categoriesError) {
      throw new Error(`获取分类列表失败: ${categoriesError.message}`);
    }
    
    // 为每个分类查询活跃事件数量
    const categoryCounts = [];
    
    for (const category of categories) {
      const { data: predictions, error: predictionsError } = await supabaseAdmin
        .from('predictions')
        .select('id')
        .eq('category', category.name)
        .eq('status', 'active');
      
      if (predictionsError) {
        console.error(`查询分类 ${category.name} 事件数量失败:`, predictionsError);
        categoryCounts.push({
          category: category.name,
          count: 0
        });
      } else {
        categoryCounts.push({
          category: category.name,
          count: predictions?.length || 0
        });
      }
    }
    
    // 返回分类热点数量
    return NextResponse.json({
      success: true,
      data: categoryCounts,
      message: '获取分类热点数量成功'
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
    
  } catch (error) {
    // 错误时降级：使用本地模拟数据计算分类数量
    console.error('获取分类热点数量失败，使用本地降级数据:', error);
    const countsByCategory: Record<string, number> = {};
    for (const p of mockPredictions) {
      countsByCategory[p.category] = (countsByCategory[p.category] || 0) + 1;
    }
    const fallback = Object.entries(countsByCategory).map(([category, count]) => ({ category, count }));
    return NextResponse.json({
      success: true,
      data: fallback,
      message: '获取分类热点数量成功(降级)'
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  }
}