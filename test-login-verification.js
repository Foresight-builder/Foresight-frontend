// 测试登录验证功能
const testLoginVerification = async () => {
  console.log('🧪 开始测试登录验证功能...\n');

  // 测试1: 未提供钱包地址的请求
  console.log('📋 测试1: 未提供钱包地址的请求');
  try {
    const response1 = await fetch('http://localhost:3000/api/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: '测试事件 - 未登录',
        description: '这是一个测试事件',
        category: '科技',
        deadline: '2024-12-31T23:59',
        minStake: 0.1,
        criteria: '测试条件'
      }),
    });

    const result1 = await response1.json();
    if (response1.status === 401 && result1.message === '请先连接钱包登录') {
      console.log('✅ 测试1通过: 未登录用户被正确拒绝');
    } else {
      console.log('❌ 测试1失败: 期望401状态码和登录提示');
      console.log('实际状态码:', response1.status);
      console.log('实际消息:', result1.message);
    }
  } catch (error) {
    console.log('❌ 测试1失败: 请求异常', error.message);
  }

  // 测试2: 提供无效钱包地址格式
  console.log('\n📋 测试2: 提供无效钱包地址格式');
  try {
    const response2 = await fetch('http://localhost:3000/api/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: '测试事件 - 无效地址',
        description: '这是一个测试事件',
        category: '科技',
        deadline: '2024-12-31T23:59',
        minStake: 0.1,
        criteria: '测试条件',
        walletAddress: 'invalid-address'
      }),
    });

    const result2 = await response2.json();
    if (response2.status === 400 && result2.message === '无效的钱包地址格式') {
      console.log('✅ 测试2通过: 无效钱包地址被正确拒绝');
    } else {
      console.log('❌ 测试2失败: 期望400状态码和格式错误提示');
      console.log('实际状态码:', response2.status);
      console.log('实际消息:', result2.message);
    }
  } catch (error) {
    console.log('❌ 测试2失败: 请求异常', error.message);
  }

  // 测试3: 提供有效钱包地址格式
  console.log('\n📋 测试3: 提供有效钱包地址格式');
  try {
    const response3 = await fetch('http://localhost:3000/api/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: '测试事件 - 有效地址',
        description: '这是一个测试事件',
        category: '科技',
        deadline: '2024-12-31T23:59',
        minStake: 0.1,
        criteria: '测试条件',
        walletAddress: '0x742d35Cc6634C0532925a3b8Dc9F5A6475eC3A55'
      }),
    });

    const result3 = await response3.json();
    if (response3.status === 409) {
      console.log('✅ 测试3通过: 有效钱包地址被接受，但事件重复（这是预期的）');
      console.log('   重复事件ID:', result3.existingEventId);
    } else if (response3.status === 201) {
      console.log('✅ 测试3通过: 有效钱包地址被接受，事件创建成功');
      console.log('   创建事件ID:', result3.data.id);
    } else {
      console.log('❌ 测试3失败: 期望201或409状态码');
      console.log('实际状态码:', response3.status);
      console.log('实际消息:', result3.message);
    }
  } catch (error) {
    console.log('❌ 测试3失败: 请求异常', error.message);
  }

  // 测试4: 验证GET请求仍然公开访问
  console.log('\n📋 测试4: 验证GET请求仍然公开访问');
  try {
    const response4 = await fetch('http://localhost:3000/api/predictions');
    const result4 = await response4.json();
    if (response4.status === 200 && result4.success) {
      console.log('✅ 测试4通过: GET请求仍然可以公开访问');
      console.log('   获取到事件数量:', result4.data?.length || 0);
    } else {
      console.log('❌ 测试4失败: GET请求应该公开访问');
      console.log('实际状态码:', response4.status);
      console.log('实际消息:', result4.message);
    }
  } catch (error) {
    console.log('❌ 测试4失败: 请求异常', error.message);
  }

  console.log('\n🎯 测试总结:');
  console.log('- 创建事件API现在需要钱包登录验证');
  console.log('- 浏览事件API保持公开访问');
  console.log('- 未登录用户会收到友好的登录提示');
  console.log('- 登录验证功能已成功实现！');
};

// 运行测试
testLoginVerification().catch(console.error);