// 预测事件API路由 - 处理GET和POST请求
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, type Prediction } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 验证JWT令牌（获取预测事件列表需要登录）
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');

    const db = getDatabase();
    
    // 构建查询条件
    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    
    if (category) {
      whereClause += " AND category = ?";
      params.push(category);
    }
    
    if (status) {
      whereClause += " AND status = ?";
      params.push(status);
    }
    
    let limitClause = "";
    if (limit) {
      const limitNum = parseInt(limit);
      limitClause = "LIMIT ?";
      params.push(limitNum);
    }
    
    const query = `SELECT * FROM predictions ${whereClause} ORDER BY createdAt DESC ${limitClause}`;
    const stmt = db.prepare(query);
    const predictions = stmt.all(...params) as Prediction[];

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
    // 验证JWT令牌（创建预测事件需要登录）
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

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
    
    const db = getDatabase();
    
    // 插入新的预测事件到数据库
    const stmt = db.prepare(`
      INSERT INTO predictions 
      (title, description, category, deadline, minStake, criteria, referenceUrl, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', datetime('now'), datetime('now'))
    `);
    
    const result = stmt.run(
      body.title,
      body.description,
      body.category,
      body.deadline,
      body.minStake,
      body.criteria,
      body.referenceUrl || ''
    );
    
    // 获取新创建的预测事件
    const getStmt = db.prepare('SELECT * FROM predictions WHERE id = ?');
    const newPrediction = getStmt.get(result.lastInsertRowid) as Prediction;
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      data: newPrediction,
      message: '预测事件创建成功'
    }, { status: 201 }); // 201表示资源创建成功
    
  } catch (error) {
    // 错误处理
    return NextResponse.json(
      { success: false, message: '创建预测事件失败', error: error.message },
      { status: 500 }
    );
  }
}