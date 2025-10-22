// 分类API路由 - 处理GET请求
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 使用Supabase查询分类列表
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('获取分类列表失败:', error);
      return NextResponse.json(
        { success: false, message: '获取分类列表失败' },
        { status: 500 }
      );
    }
    
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