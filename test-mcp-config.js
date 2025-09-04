// Test script for MCP per-user configuration
// Run with: node test-mcp-config.js

const testUserId = 'testuser123';

async function testMCPConfigAPI() {
  console.log('🧪 Testing MCP Per-User Configuration API\n');

  try {
    // Test 1: Get user config (should return sample config)
    console.log('1. Testing GET /api/mcp-config/' + testUserId);
    const getResponse = await fetch(`http://localhost:3001/api/mcp-config/${testUserId}`);
    const getData = await getResponse.json();

    if (getResponse.ok) {
      console.log('✅ GET successful');
      console.log('   Servers:', getData.servers?.length || 0);
      console.log('   Selected:', getData.selectedServers?.length || 0);
    } else {
      console.log('❌ GET failed:', getData.error);
    }

    // Test 2: Save user config
    console.log('\n2. Testing POST /api/mcp-config/' + testUserId);
    const testConfig = {
      servers: [
        {
          id: 'test-server-1',
          name: 'Test MCP Server',
          url: 'https://test-mcp.example.com/sse',
          type: 'sse',
          description: 'Test server for API validation',
          status: 'disconnected',
          headers: [{ key: 'Authorization', value: 'Bearer test-token' }]
        }
      ],
      selectedServers: ['test-server-1'],
      lastUpdated: new Date().toISOString()
    };

    const postResponse = await fetch(`http://localhost:3001/api/mcp-config/${testUserId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testConfig)
    });

    if (postResponse.ok) {
      console.log('✅ POST successful - Config saved');
    } else {
      console.log('❌ POST failed:', (await postResponse.json()).error);
    }

    // Test 3: Get updated config
    console.log('\n3. Testing GET updated config');
    const updatedGetResponse = await fetch(`http://localhost:3001/api/mcp-config/${testUserId}`);
    const updatedData = await updatedGetResponse.json();

    if (updatedGetResponse.ok) {
      console.log('✅ Updated config retrieved');
      console.log('   Servers:', updatedData.servers?.length || 0);
      console.log('   Selected:', updatedData.selectedServers?.length || 0);
      console.log('   Server name:', updatedData.servers?.[0]?.name);
    } else {
      console.log('❌ Updated config retrieval failed');
    }

    console.log('\n🎉 MCP Config API tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testMCPConfigAPI();
