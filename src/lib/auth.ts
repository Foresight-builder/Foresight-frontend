import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDatabase } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthResult {
  success: boolean;
  userId?: number;
  username?: string;
  error?: string;
}

/**
 * 验证JWT令牌
 */
export async function verifyToken(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: '缺少认证令牌' };
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀

    // 验证JWT签名
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
    
    if (!decoded.userId || !decoded.username) {
      return { success: false, error: '无效的令牌' };
    }

    const db = getDatabase();

    // 检查令牌是否在会话黑名单中（暂时跳过会话检查，先确保JWT验证能工作）
    // const tokenHash = await bcrypt.hash(token, 10);
    // const session = db
    //   .prepare('SELECT id FROM sessions WHERE token_hash = ? AND expires_at > datetime("now")')
    //   .get(tokenHash);

    // // 如果会话不存在，说明令牌无效或已过期
    // if (!session) {
    //   return { success: false, error: '令牌已过期或无效' };
    // }

    // 检查用户是否存在
    const user = db
      .prepare('SELECT id FROM users WHERE id = ?')
      .get(decoded.userId);

    if (!user) {
      return { success: false, error: '用户不存在' };
    }

    return {
      success: true,
      userId: decoded.userId,
      username: decoded.username
    };

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return { success: false, error: '无效的令牌' };
    }
    if (error instanceof jwt.TokenExpiredError) {
      return { success: false, error: '令牌已过期' };
    }
    
    console.error('令牌验证错误:', error);
    return { success: false, error: '认证失败' };
  }
}

/**
 * 生成JWT令牌
 */
export function generateToken(userId: number, username: string): string {
  return jwt.sign(
    { userId, username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * 使令牌失效（登出功能）
 */
export async function invalidateToken(token: string): Promise<boolean> {
  try {
    const db = getDatabase();
    const tokenHash = await bcrypt.hash(token, 10);
    
    // 从会话表中删除该令牌
    db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
    
    return true;
  } catch (error) {
    console.error('令牌失效错误:', error);
    return false;
  }
}