-- 为predictions表添加image_url字段
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 为image_url字段添加注释
COMMENT ON COLUMN predictions.image_url IS '预测事件的图片URL，用于在trending页面展示';

-- 更新现有数据，为没有图片的事件设置默认图片
UPDATE predictions 
SET image_url = 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=1000&q=80'
WHERE image_url IS NULL;

-- 验证修改是否成功
SELECT id, title, image_url FROM predictions LIMIT 5;