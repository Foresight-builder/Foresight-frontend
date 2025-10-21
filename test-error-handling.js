// 测试API错误处理机制
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testErrorHandling() {
  console.log('🧪 测试API错误处理机制...\n');
  
  try {
    // 测试1: 缺少必填字段
    console.log('1. 测试缺少必填字段...');
    const missingFieldsEvent = {
      title: '测试缺少字段',
      // 故意缺少 description、category、deadline、minStake、criteria
    };
    
    const missingFieldsResponse = await fetch('http://localhost:3000/api/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(missingFieldsEvent)
    });

    const missingFieldsResult = await missingFieldsResponse.json();
    
    if (missingFieldsResponse.status === 400 && !missingFieldsResult.success) {
      console.log('✅ 缺少必填字段错误处理正确!');
      console.log(`   错误消息: ${missingFieldsResult.message}`);
      console.log(`   状态码: ${missingFieldsResponse.status} (Bad Request)`);
      
      if (missingFieldsResult.missingFields) {
        console.log(`   缺少的字段: ${missingFieldsResult.missingFields.join(', ')}`);
      }
    } else {
      console.log('❌ 缺少必填字段错误处理不正确!');
      return false;
    }

    // 测试2: 无效的数据类型
    console.log('\n2. 测试无效的数据类型...');
    const invalidTypeEvent = {
      title: '测试无效类型',
      description: '测试描述',
      category: '科技',
      deadline: '2025-12-31T23:59:59.000Z',
      minStake: 'invalid', // 字符串而不是数字
      criteria: '测试标准'
    };
    
    const invalidTypeResponse = await fetch('http://localhost:3000/api/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidTypeEvent)
    });

    const invalidTypeResult = await invalidTypeResponse.json();
    
    if (invalidTypeResponse.status === 400 && !invalidTypeResult.success) {
      console.log('✅ 无效数据类型错误处理正确!');
      console.log(`   错误消息: ${invalidTypeResult.message}`);
      console.log(`   状态码: ${invalidTypeResponse.status} (Bad Request)`);
    } else {
      console.log('❌ 无效数据类型错误处理不正确!');
      return false;
    }

    // 测试3: 无效的minStake值
    console.log('\n3. 测试无效的minStake值...');
    const invalidStakeEvent = {
      title: '测试无效押注',
      description: '测试描述',
      category: '科技',
      deadline: '2025-12-31T23:59:59.000Z',
      minStake: -1, // 负数
      criteria: '测试标准'
    };
    
    const invalidStakeResponse = await fetch('http://localhost:3000/api/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidStakeEvent)
    });

    const invalidStakeResult = await invalidStakeResponse.json();
    
    if (invalidStakeResponse.status === 400 && !invalidStakeResult.success) {
      console.log('✅ 无效押注值错误处理正确!');
      console.log(`   错误消息: ${invalidStakeResult.message}`);
      console.log(`   状态码: ${invalidStakeResponse.status} (Bad Request)`);
    } else {
      console.log('❌ 无效押注值错误处理不正确!');
      return false;
    }

    // 测试4: 有效的请求应该成功
    console.log('\n4. 测试有效的请求...');
    const validEvent = {
      title: '测试错误处理验证',
      description: '这是一个用于验证错误处理的测试事件',
      category: '科技',
      deadline: '2025-12-31T23:59:59.000Z',
      minStake: 0.1,
      criteria: '测试标准'
    };
    
    const validResponse = await fetch('http://localhost:3000/api/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validEvent)
    });

    const validResult = await validResponse.json();
    
    if (validResponse.ok && validResult.success) {
      console.log('✅ 有效请求处理正确!');
      console.log(`   状态码: ${validResponse.status} (Created)`);
      console.log(`   事件ID: ${validResult.data.id}`);
    } else {
      console.log('❌ 有效请求处理失败!');
      console.log(`   错误消息: ${validResult.message}`);
      return false;
    }

    // 测试5: 验证GET请求正常工作
    console.log('\n5. 测试GET请求...');
    const getResponse = await fetch('http://localhost:3000/api/predictions');
    const getResult = await getResponse.json();
    
    if (getResponse.ok && getResult.success) {
      console.log('✅ GET请求处理正确!');
      console.log(`   获取到 ${getResult.data.length} 个事件`);
    } else {
      console.log('❌ GET请求处理失败!');
      return false;
    }

    console.log('\n🎉 所有错误处理测试通过！API错误处理机制正常工作。');
    return true;
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
    return false;
  }
}

// 执行测试
testErrorHandling().then(success => {
  if (success) {
    console.log('\n✅ API错误处理机制测试通过！');
    console.log('系统现在能够正确处理各种错误情况。');
  } else {
    console.log('\n❌ API错误处理机制测试失败');
    console.log('需要检查API的错误处理逻辑。');
  }
  
  process.exit(success ? 0 : 1);
});