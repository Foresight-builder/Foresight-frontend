const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// 从环境变量获取Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('错误：请确保 .env.local 文件中的 Supabase 配置已正确设置');
  console.log('需要配置：');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// 创建服务端客户端（需要管理员权限）
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupDuplicateTitles() {
  console.log('开始清理重复标题的预测事件...\n');

  try {
    // 1. 查询所有预测事件，按标题分组统计
    const { data: allPredictions, error: fetchError } = await supabase
      .from('predictions')
      .select('id, title, category, status, created_at')
      .order('created_at', { ascending: true });

    if (fetchError) {
      throw new Error(`查询预测事件失败: ${fetchError.message}`);
    }

    if (!allPredictions || allPredictions.length === 0) {
      console.log('没有找到任何预测事件，无需清理。');
      return;
    }

    console.log(`共找到 ${allPredictions.length} 个预测事件\n`);

    // 2. 按标题分组，找出重复的标题
    const titleGroups = {};
    allPredictions.forEach(prediction => {
      if (!titleGroups[prediction.title]) {
        titleGroups[prediction.title] = [];
      }
      titleGroups[prediction.title].push(prediction);
    });

    // 3. 找出有重复的标题
    const duplicateTitles = Object.keys(titleGroups).filter(
      title => titleGroups[title].length > 1
    );

    if (duplicateTitles.length === 0) {
      console.log('没有发现重复标题的预测事件，无需清理。');
      return;
    }

    console.log(`发现 ${duplicateTitles.length} 个重复标题：`);
    duplicateTitles.forEach(title => {
      console.log(`- "${title}": ${titleGroups[title].length} 个事件`);
    });
    console.log('');

    // 4. 为每个重复标题保留最早创建的事件，删除其他重复事件
    let totalDeleted = 0;
    const deletedEvents = [];

    for (const title of duplicateTitles) {
      const events = titleGroups[title];
      
      // 按创建时间排序，保留最早的事件
      events.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      const keepEvent = events[0]; // 保留最早的事件
      const deleteEvents = events.slice(1); // 删除其他重复事件

      console.log(`处理标题 "${title}":`);
      console.log(`  - 保留: ID ${keepEvent.id} (创建于 ${keepEvent.created_at})`);

      // 删除重复事件
      for (const event of deleteEvents) {
        console.log(`  - 删除: ID ${event.id} (创建于 ${event.created_at})`);
        
        // 先删除相关的押注记录（如果有的话）
        const { error: betsError } = await supabase
          .from('bets')
          .delete()
          .eq('prediction_id', event.id);

        if (betsError) {
          console.log(`    - 删除押注记录失败: ${betsError.message}`);
        } else {
          console.log('    - 已删除相关押注记录');
        }

        // 删除预测事件
        const { error: deleteError } = await supabase
          .from('predictions')
          .delete()
          .eq('id', event.id);

        if (deleteError) {
          throw new Error(`删除事件 ID ${event.id} 失败: ${deleteError.message}`);
        }

        deletedEvents.push({
          id: event.id,
          title: event.title,
          category: event.category,
          status: event.status,
          created_at: event.created_at
        });
        totalDeleted++;
      }
      console.log('');
    }

    // 5. 输出清理结果
    console.log('='.repeat(50));
    console.log('清理完成！');
    console.log(`- 总共删除了 ${totalDeleted} 个重复事件`);
    console.log(`- 保留了 ${allPredictions.length - totalDeleted} 个唯一事件`);
    console.log('');

    if (deletedEvents.length > 0) {
      console.log('删除的事件详情：');
      deletedEvents.forEach(event => {
        console.log(`- ID ${event.id}: "${event.title}" (${event.category}, ${event.status})`);
      });
    }

  } catch (error) {
    console.error('清理过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 运行清理脚本
cleanupDuplicateTitles()
  .then(() => {
    console.log('\n脚本执行完成。');
    process.exit(0);
  })
  .catch(error => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });