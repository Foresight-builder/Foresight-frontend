-- 为predictions表添加唯一性约束的SQL脚本
-- 防止创建完全重复的预测事件

-- 1. 首先检查当前表结构
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'predictions' 
ORDER BY ordinal_position;

-- 2. 检查当前是否有重复数据
SELECT 
    title, 
    description, 
    category, 
    deadline,
    COUNT(*) as duplicate_count
FROM predictions 
GROUP BY title, description, category, deadline
HAVING COUNT(*) > 1;

-- 3. 添加唯一性约束（基于标题、描述、分类和截止时间的组合）
-- 这样可以防止创建完全相同的预测事件
ALTER TABLE predictions 
ADD CONSTRAINT unique_prediction 
UNIQUE (title, description, category, deadline);

-- 4. 验证约束已添加
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint 
WHERE conrelid = 'predictions'::regclass 
AND contype = 'u'; -- 'u' 表示唯一约束

-- 5. 创建索引以提高唯一性检查性能
CREATE INDEX IF NOT EXISTS idx_predictions_unique_check 
ON predictions (title, description, category, deadline);

-- 6. 测试约束是否正常工作（可选）
-- 尝试插入重复数据应该会失败
-- INSERT INTO predictions (title, description, category, deadline, min_stake, criteria) VALUES 
--   ('测试重复事件', '这是一个测试重复事件', '科技', '2024-12-31 23:59:59', 0.1, '测试标准');