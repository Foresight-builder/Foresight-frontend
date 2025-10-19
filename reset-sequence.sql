-- 重置Supabase序列的SQL脚本
-- 在Supabase SQL编辑器中执行此脚本

-- 1. 首先检查当前序列状态
SELECT 
  sequence_name,
  last_value,
  start_value,
  increment_by
FROM information_schema.sequences 
WHERE sequence_name = 'predictions_id_seq';

-- 2. 获取当前最大id值
SELECT MAX(id) as max_id FROM predictions;

-- 3. 重置序列到当前最大id值 + 1
SELECT setval('predictions_id_seq', (SELECT MAX(id) FROM predictions) + 1);

-- 4. 验证序列已正确重置
SELECT currval('predictions_id_seq') as current_sequence_value;