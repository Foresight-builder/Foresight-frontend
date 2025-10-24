// 测试创建事件API
const testCreateEvent = async () => {
  console.log('正在测试创建事件API...');
  
  const testData = {
    walletAddress: '0x742d35Cc6634C0532925a3b8D9C1aB7e8a1A9F1C', // 测试钱包地址
    title: '测试事件 - ' + Date.now(),
    description: '这是一个测试事件描述',
    category: '科技',
    deadline: '2024-12-31',
    minStake: 10,
    criteria: '当事件条件满足时触发',
    reference_url: 'https://example.com'
  };

  try {
    const response = await fetch('http://localhost:3000/api/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log('响应状态:', response.status);
    console.log('响应结果:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ 创建事件成功!');
    } else {
      console.log('❌ 创建事件失败:', result.message);
    }
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
  }
};

testCreateEvent();