const { createClient } = require('@supabase/supabase-js');

// 从环境变量获取Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ 环境变量未设置');
  console.log('请检查.env.local文件中的配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  try {
    console.log('🔍 检查数据库状态...');
    
    // 获取当前预测事件数据
    const { data, error } = await supabase
      .from('predictions')
      .select('id, title, created_at')
      .order('id', { ascending: true });
    
    if (error) {
      console.log('❌ 查询错误:', error);
      return;
    }
    
    console.log('📊 当前预测事件:');
    if (data.length === 0) {
      console.log('   数据库为空');
    } else {
      data.forEach(prediction => {
        console.log(`   ID: ${prediction.id}, 标题: ${prediction.title}`);
      });
    }
    
    // 获取最大ID
    const maxId = data.length > 0 ? Math.max(...data.map(p => p.id)) : 0;
    console.log(`📈 最大ID: ${maxId}`);
    
    // 尝试插入测试数据
    console.log('🧪 测试插入新数据...');
    const testData = {
      title: '测试预测事件',
      description: '这是一个测试事件',
      category: '其他',
      deadline: '2024-12-31 23:59:59',
      min_stake: 0.01,
      criteria: '测试标准',
      reference_url: '',
      status: 'active'
    };
    
    const { data: newData, error: insertError } = await supabase
      .from('predictions')
      .insert(testData)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ 插入错误:', insertError);
      console.log('💡 建议: 需要重置数据库序列');
    } else {
      console.log('✅ 插入成功!');
      console.log(`   新记录ID: ${newData.id}`);
      
      // 删除测试数据
      await supabase
        .from('predictions')
        .delete()
        .eq('id', newData.id);
      console.log('🧹 已清理测试数据');
    }
    
  } catch (err) {
    console.log('❌ 检查失败:', err);
  }
}

checkDatabase();