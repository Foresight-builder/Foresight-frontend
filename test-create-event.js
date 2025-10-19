// 测试创建事件功能 - 通过API端点测试
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testCreateEvent() {
  console.log('测试创建事件功能...');
  
  try {
    // 测试事件数据
    const testEvent = {
      title: '测试事件 - ' + new Date().toISOString(),
      description: '这是一个测试事件，用于验证创建功能是否正常工作',
      category: '科技',
      deadline: '2025-12-31T23:59:59.000Z',
      min_stake: 0.1,
      criteria: '测试标准：事件创建成功即可',
      reference_url: ''
    };

    console.log('测试事件数据:', testEvent);
    
    // 通过API端点创建事件
    const response = await fetch('http://localhost:3001/api/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEvent)
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ 事件创建成功!');
      console.log('创建的事件数据:', result.data);
      
      // 验证数据是否正确存储 - 通过GET API验证
      const verifyResponse = await fetch('http://localhost:3001/api/predictions');
      const verifyResult = await verifyResponse.json();
      
      if (verifyResponse.ok && verifyResult.success) {
        const createdEvent = verifyResult.data.find(event => event.title === testEvent.title);
        if (createdEvent) {
          console.log('✅ 事件数据验证成功!');
          console.log('验证数据:', createdEvent);
          return true;
        } else {
          console.log('❌ 验证事件数据失败: 未找到创建的事件');
          return false;
        }
      } else {
        console.log('❌ 验证事件数据失败:', verifyResult.message);
        return false;
      }
    } else {
      console.log('❌ 创建事件失败:', result.message);
      console.log('错误详情:', result);
      return false;
    }
    
  } catch (err) {
    console.log('❌ 测试过程中出错:', err.message);
    return false;
  }
}

// 执行测试
testCreateEvent().then(success => {
  if (success) {
    console.log('\n🎉 创建事件功能测试通过！');
    console.log('现在你可以在预览界面中成功创建事件了。');
  } else {
    console.log('\n❌ 创建事件功能测试失败');
    console.log('需要检查数据库权限配置或API端点代码。');
  }
  
  process.exit(success ? 0 : 1);
});