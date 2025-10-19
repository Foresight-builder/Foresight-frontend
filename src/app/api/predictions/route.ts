// 预测事件API路由 - 处理GET和POST请求
import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin, type Prediction } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // 对于获取预测事件列表，允许匿名访问（不需要登录）
    // 只有创建预测事件等敏感操作才需要登录验证

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');

    // 构建Supabase查询
    let query = supabase
      .from('predictions')
      .select('*')
      .order('created_at', { ascending: false });
    
    // 添加过滤条件
    if (category) {
      query = query.eq('category', category);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (limit) {
      const limitNum = parseInt(limit);
      query = query.limit(limitNum);
    }
    
    const { data: predictions, error } = await query;

    if (error) {
      console.error('获取预测事件列表失败:', error);
      return NextResponse.json(
        { success: false, message: '获取预测事件列表失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: predictions,
      message: '获取预测事件列表成功'
    });
    
  } catch (error) {
    console.error('获取预测事件列表失败:', error);
    return NextResponse.json(
      { success: false, message: '获取预测事件列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 解析请求体中的JSON数据
    const body = await request.json();
    
    // 验证必填字段
    const requiredFields = ['title', 'description', 'category', 'deadline', 'minStake', 'criteria'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: '缺少必填字段', 
          missingFields 
        },
        { status: 400 }
      );
    }
    
    // 验证数据类型
    if (typeof body.minStake !== 'number' || body.minStake <= 0) {
      return NextResponse.json(
        { success: false, message: '最小押注必须是大于0的数字' },
        { status: 400 }
      );
    }
    
    // 插入新的预测事件到Supabase数据库
    // 先获取当前最大id，然后手动指定id来避免序列冲突
    const { data: maxIdData, error: maxIdError } = await supabaseAdmin
      .from('predictions')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);
    
    if (maxIdError) {
      console.error('获取最大ID失败:', maxIdError);
      return NextResponse.json(
        { success: false, message: '创建预测事件失败' },
        { status: 500 }
      );
    }
    
    const nextId = maxIdData.length > 0 ? maxIdData[0].id + 1 : 1;
    
    const { data: newPrediction, error } = await supabaseAdmin
      .from('predictions')
      .insert({
        id: nextId, // 手动指定id，避免序列冲突
        title: body.title,
        description: body.description,
        category: body.category,
        deadline: body.deadline,
        min_stake: body.minStake,
        criteria: body.criteria,
        reference_url: body.reference_url || '',
        status: 'active'
      })
      .select()
      .single();
    
    if (error) {
      console.error('创建预测事件失败:', error);
      return NextResponse.json(
        { success: false, message: '创建预测事件失败' },
        { status: 500 }
      );
    }
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      data: newPrediction,
      message: '预测事件创建成功'
    }, { status: 201 }); // 201表示资源创建成功
    
  } catch (error) {
    // 错误处理
    console.error('创建预测事件异常:', error);
    return NextResponse.json(
      { success: false, message: '创建预测事件失败', error: error.message },
      { status: 500 }
    );
  }
}