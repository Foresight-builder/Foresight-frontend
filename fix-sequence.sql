-- 修复Supabase序列问题
-- 重置predictions表的序列以匹配当前最大id值

-- 获取当前最大的id值
SELECT MAX(id) FROM predictions;

-- 重置序列到当前最大id值 + 1
SELECT setval('predictions_id_seq', (SELECT MAX(id) FROM predictions) + 1);

-- 验证序列值
SELECT currval('predictions_id_seq');