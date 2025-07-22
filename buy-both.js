const WebSocket = require('ws');

// 💡 Replace this with your API Token (or use process.env.DERIV_API_TOKEN)
const API_TOKEN = process.env.DERIV_API_TOKEN || 'Sst6KXGL2Nh8zpx';

// 🏦 Trading configuration
const TRADES = [
    {
        symbol: 'RDBEAR',            // ✅ Use a valid API symbol (like R_100)
        contract_type: 'PUT',
        barrier: '-150',           // ✅ Barrier offset for no-loss strategy
        stake: 10,                   // 💲 Amount to stake

        duration: 1000,                // ⏱ Duration
        duration_unit: 'm',
    },
    {
        symbol: 'RDBULL',
        contract_type: 'CALL',
        barrier: '+250',
        stake: 10,
        duration: 1000,
        duration_unit: 'm',
    },

];

// 🌐 Connect to Deriv WebSocket API
const ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');

// 🔥 Utility function to send data
const send = (data) => ws.send(JSON.stringify(data));

// ✅ WebSocket Events
ws.on('open', () => {
    console.log('🔗 WebSocket connected');
    send({ authorize: API_TOKEN });
});

ws.on('message', (msg) => {
    const data = JSON.parse(msg);

    if (data.msg_type === 'authorize') {
        console.log('✅ Authorized successfully');
        placeAllTrades();
    }

    if (data.buy && data.buy.longcode) {
        console.log(`🛒 Trade placed: ${data.buy.longcode}`);
        console.log(`📄 Contract ID: ${data.buy.contract_id}`);
    }

    if (data.error) {
        console.error('❌ API Error:', data.error.message);
    }
});

ws.on('close', () => {
    console.log('🔌 WebSocket disconnected');
});

ws.on('error', (err) => {
    console.error('⚠️ WebSocket Error:', err.message);
});

// 📈 Place a single trade
function placeTrade(trade) {
    const contract = {
        buy: 1,
        price: trade.stake,
        parameters: {
            amount: trade.stake,
            basis: 'stake',
            contract_type: trade.contract_type,
            currency: 'USD',
            duration: trade.duration,
            duration_unit: trade.duration_unit,
            symbol: trade.symbol,
        },
    };

    // ➕ Add barrier if provided
    if (trade.barrier) {
        contract.parameters.barrier = trade.barrier;
    }

    console.log(`📈 Placing trade: ${trade.symbol} ${trade.contract_type} Barrier: ${trade.barrier}`);
    send(contract);
}

// 🔥 Place all trades simultaneously
function placeAllTrades() {
    for (const trade of TRADES) {
        placeTrade(trade);
    }

    // Wait 10 seconds before closing WebSocket
    setTimeout(() => {
        ws.close();
    }, 10000);
}
