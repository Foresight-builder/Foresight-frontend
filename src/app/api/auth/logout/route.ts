import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, invalidateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // 验证JWT令牌
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.substring(7); // 移除 'Bearer ' 前缀

    if (!token) {
      return NextResponse.json(
        { success: false, error: '无效的令牌' },
        { status: 400 }
      );
    }

    // 使令牌失效
    const success = await invalidateToken(token);

    if (!success) {
      return NextResponse.json(
        { success: false, error: '登出失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '登出成功'
    });

  } catch (error) {
    console.error('登出错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}