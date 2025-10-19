import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    // 验证必填字段
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: '用户名、邮箱和密码为必填项' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: '密码长度至少为6位' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // 检查用户名是否已存在
    const existingUserByUsername = db
      .prepare('SELECT id FROM users WHERE username = ?')
      .get(username);
    
    if (existingUserByUsername) {
      return NextResponse.json(
        { success: false, error: '用户名已存在' },
        { status: 409 }
      );
    }

    // 检查邮箱是否已存在
    const existingUserByEmail = db
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(email);
    
    if (existingUserByEmail) {
      return NextResponse.json(
        { success: false, error: '邮箱已被注册' },
        { status: 409 }
      );
    }

    // 加密密码
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 插入新用户
    const result = db
      .prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)')
      .run(username, email, passwordHash);

    return NextResponse.json({
      success: true,
      message: '用户注册成功',
      user: {
        id: result.lastInsertRowid,
        username,
        email
      }
    }, { status: 201 });

  } catch (error) {
    console.error('注册错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}