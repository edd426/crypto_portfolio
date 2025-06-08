/**
 * Debug CoinGecko API calls
 */

const axios = require('axios');

async function debugAPI() {
  console.log('🔍 Debugging CoinGecko API calls...');

  try {
    // Test 1: Get market data (should work)
    console.log('\n1️⃣ Testing market data endpoint...');
    const marketUrl = 'https://api.coingecko.com/api/v3/coins/markets';
    const marketParams = {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 5,
      page: 1,
      sparkline: false
    };

    const marketResponse = await axios.get(marketUrl, { params: marketParams });
    console.log(`✅ Market data: Got ${marketResponse.data.length} coins`);
    console.log(`   Top coin: ${marketResponse.data[0]?.symbol?.toUpperCase()} (${marketResponse.data[0]?.name})`);

    // Test 2: Get historical data for Bitcoin
    console.log('\n2️⃣ Testing historical data endpoint...');
    const historyUrl = 'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart';
    const historyParams = {
      vs_currency: 'usd',
      days: 'max',
      interval: 'daily'
    };

    const historyResponse = await axios.get(historyUrl, { params: historyParams });
    console.log(`✅ Historical data: Got ${historyResponse.data.prices?.length} data points for Bitcoin`);
    
    if (historyResponse.data.prices?.length > 0) {
      const firstPoint = historyResponse.data.prices[0];
      const lastPoint = historyResponse.data.prices[historyResponse.data.prices.length - 1];
      
      const firstDate = new Date(firstPoint[0]).toISOString().split('T')[0];
      const lastDate = new Date(lastPoint[0]).toISOString().split('T')[0];
      
      console.log(`   Date range: ${firstDate} to ${lastDate}`);
      console.log(`   First price: $${firstPoint[1].toLocaleString()}`);
      console.log(`   Latest price: $${lastPoint[1].toLocaleString()}`);
    }

    // Test 3: Check rate limiting headers
    console.log('\n3️⃣ Rate limiting info:');
    const headers = historyResponse.headers;
    console.log(`   Rate limit remaining: ${headers['x-ratelimit-remaining'] || 'Not provided'}`);
    console.log(`   Rate limit reset: ${headers['x-ratelimit-reset'] || 'Not provided'}`);

    console.log('\n✅ All API tests passed! The download script should work.');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Headers:`, error.response.headers);
      
      if (error.response.status === 429) {
        console.log('   Issue: Rate limit exceeded');
        console.log('   Solution: Wait and retry, or reduce request frequency');
      } else if (error.response.status === 401) {
        console.log('   Issue: Unauthorized - this is unusual for CoinGecko free API');
        console.log('   Solution: Check if CoinGecko changed their API requirements');
      }
    }
  }
}

debugAPI();