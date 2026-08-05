const axios = require('axios');

async function run() {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            username: 'snake.eth',
            password: 'password123'
        });
        const token = res.data.token;
        console.log("Token:", token.substring(0, 15) + "...");
        
        const dashboard = await axios.get('http://localhost:5000/api/wallet/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Dashboard Success:", dashboard.data.success);
        console.log("Assets:", dashboard.data.assets.length);
        console.log("MarketData isArray:", Array.isArray(dashboard.data.marketData));
    } catch (e) {
        console.error("Error:", e.response ? e.response.data : e.message);
    }
}

run();
