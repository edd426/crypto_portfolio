/**
 * Test alternative CoinGecko endpoints for historical data
 */

const axios = require('axios');

async function testAlternatives() {
  console.log('🔍 Testing alternative approaches for historical data...');

  try {
    // Test 1: Simple price endpoint with multiple currencies
    console.log('\n1️⃣ Testing simple price endpoint...');
    const priceUrl = 'https://api.coingecko.com/api/v3/simple/price';
    const priceParams = {
      ids: 'bitcoin,ethereum,ripple',
      vs_currencies: 'usd',
      include_market_cap: 'true',
      include_24hr_vol: 'true',
      include_24hr_change: 'true',
      include_last_updated_at: 'true'
    };

    const priceResponse = await axios.get(priceUrl, { params: priceParams });
    console.log(`✅ Simple price: Got data for ${Object.keys(priceResponse.data).length} coins`);
    console.log(`   BTC: $${priceResponse.data.bitcoin?.usd?.toLocaleString()}`);

    // Test 2: Coin list to get proper IDs
    console.log('\n2️⃣ Getting coin list...');
    const listUrl = 'https://api.coingecko.com/api/v3/coins/list';
    const listResponse = await axios.get(listUrl);
    console.log(`✅ Coin list: ${listResponse.data.length} coins available`);
    
    const bitcoin = listResponse.data.find(coin => coin.symbol === 'btc');
    console.log(`   Bitcoin ID: ${bitcoin?.id}`);

    // Test 3: Try historical data with shorter period
    console.log('\n3️⃣ Testing shorter historical period (30 days)...');
    const shortHistoryUrl = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart`;
    const shortParams = {
      vs_currency: 'usd',
      days: 30
    };

    const shortResponse = await axios.get(shortHistoryUrl, { params: shortParams });
    console.log(`✅ Short history: Got ${shortResponse.data.prices?.length} data points`);

    // Test 4: Try 1 year of data
    console.log('\n4️⃣ Testing 1 year of historical data...');
    const yearParams = {
      vs_currency: 'usd',
      days: 365
    };

    const yearResponse = await axios.get(shortHistoryUrl, { params: yearParams });
    console.log(`✅ 1 year history: Got ${yearResponse.data.prices?.length} data points`);

    // Test 5: Try max data again but with different parameters
    console.log('\n5️⃣ Testing max data with minimal parameters...');
    const maxParams = {
      vs_currency: 'usd',
      days: 'max'
    };

    const maxResponse = await axios.get(shortHistoryUrl, { params: maxParams });
    console.log(`✅ Max history: Got ${maxResponse.data.prices?.length} data points`);
    
    if (maxResponse.data.prices?.length > 0) {
      const firstPoint = maxResponse.data.prices[0];
      const lastPoint = maxResponse.data.prices[maxResponse.data.prices.length - 1];
      
      const firstDate = new Date(firstPoint[0]).toISOString().split('T')[0];
      const lastDate = new Date(lastPoint[0]).toISOString().split('T')[0];
      
      console.log(`   Full range: ${firstDate} to ${lastDate} (${maxResponse.data.prices.length} days)`);
    }

    console.log('\n✅ Historical data access is working! The 401 error might have been temporary.');

  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      
      if (error.response.status === 429) {
        console.log('   Rate limited - need to slow down requests');
      } else if (error.response.status === 401) {
        console.log('   Still getting 401 - CoinGecko may have changed API requirements');
      }
    }
  }
}

testAlternatives();