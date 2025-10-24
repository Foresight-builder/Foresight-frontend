// 测试重复事件创建预防功能
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testDuplicatePrevention() {
  console.log('🧪 测试重复事件创建预防功能...\n');
  
  try {
    // 测试事件数据
    const testEvent = {
      title: '测试重复事件预防',
      description: '这是一个用于测试重复事件预防功能的测试事件',
      category: '科技',
      deadline: '2025-12-31T23:59:59.000Z',
      minStake: 0.1,
      criteria: '测试标准：验证重复事件创建是否被正确阻止',
      reference_url: ''
    };

    console.log('1. 第一次创建事件...');
    
    // 第一次创建事件
    const firstResponse = await fetch('http://localhost:3000/api/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEvent)
    });

    const firstResult = await firstResponse.json();
    
    if (firstResponse.ok && firstResult.success) {
      console.log('✅ 第一次创建成功!');
      console.log(`   事件ID: ${firstResult.data.id}`);
    } else {
      console.log('❌ 第一次创建失败:', firstResult.message);
      return false;
    }

    console.log('\n2. 尝试创建完全相同的事件...');
    
    // 尝试创建完全相同的事件
    const secondResponse = await fetch('http://localhost:3000/api/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEvent)
    });

    const secondResult = await secondResponse.json();
    
    if (secondResponse.status === 409 && !secondResult.success) {
      console.log('✅ 重复事件创建被正确阻止!');
      console.log(`   错误消息: ${secondResult.message}`);
      console.log(`   状态码: ${secondResponse.status} (Conflict)`);
      
      if (secondResult.existingEventId) {
        console.log(`   已存在的事件ID: ${secondResult.existingEventId}`);
      }
    } else {
      console.log('❌ 重复事件创建未被正确阻止!');
      console.log(`   状态码: ${secondResponse.status}`);
      console.log(`   响应:`, secondResult);
      return false;
    }

    console.log('\n3. 测试轻微不同的数据是否允许创建...');
    
    // 测试轻微不同的数据（修改描述）
    const modifiedEvent = {
      ...testEvent,
      description: '这是一个修改后的描述，应该允许创建'
    };
    
    const thirdResponse = await fetch('http://localhost:3000/api/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(modifiedEvent)
    });

    const thirdResult = await thirdResponse.json();
    
    if (thirdResponse.ok && thirdResult.success) {
      console.log('✅ 轻微不同的数据允许创建!');
      console.log(`   新事件ID: ${thirdResult.data.id}`);
    } else {
      console.log('❌ 轻微不同的数据创建失败:', thirdResult.message);
      return false;
    }

    console.log('\n4. 验证数据库中的事件数量...');
    
    // 验证数据库中的事件数量
    const listResponse = await fetch('http://localhost:3000/api/predictions');
    const listResult = await listResponse.json();
    
    if (listResponse.ok && listResult.success) {
      const testEvents = listResult.data.filter(event => 
        event.title === '测试重复事件预防'
      );
      
      console.log(`   数据库中标题为"测试重复事件预防"的事件数量: ${testEvents.length}`);
      
      if (testEvents.length === 2) {
        console.log('✅ 数据库事件数量正确!');
      } else {
        console.log('❌ 数据库事件数量不正确!');
        return false;
      }
    } else {
      console.log('❌ 获取事件列表失败:', listResult.message);
      return false;
    }

    console.log('\n🎉 所有测试通过！重复事件创建预防功能正常工作。');
    return true;
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
    return false;
  }
}

// 执行测试
testDuplicatePrevention().then(success => {
  if (success) {
    console.log('\n✅ 重复事件创建预防功能测试通过！');
    console.log('现在系统会正确阻止创建完全重复的预测事件。');
  } else {
    console.log('\n❌ 重复事件创建预防功能测试失败');
    console.log('需要检查API实现或数据库约束。');
  }
  
  process.exit(success ? 0 : 1);
});