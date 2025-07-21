const WebSocket = require('ws');

const API_TOKEN = process.env.DERIV_API_TOKEN;  // Secure token from GitHub Secrets

// Trade 1 (RDBULL - Call)
const TRADE_1 = {
    symbol: 'RDBULL',
    contract_type: 'CALL',
    barrier: '+0.1',
    stake: 1,
    duration: 1,
    duration_unit: 'm',
};

// Trade 2 (RDBEAR - Put)
const TRADE_2 = {
    symbol: 'RDBEAR',
    contract_type: 'PUT',
    barrier: '-0.01',
    stake: 10,
    duration: 120,
    duration_unit: 'm',
};

const ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');

const send = (data) => ws.send(JSON.stringify(data));

ws.on('open', () => {
    console.log('🔗 WebSocket connected');
    send({ authorize: API_TOKEN });
});

ws.on('message', (msg) => {
    const data = JSON.parse(msg);
    if (data.msg_type === 'authorize') {
        console.log('✅ Authorized');
        placeBothTrades();
    }
    if (data.buy && data.buy.longcode) {
        console.log(`🛒 Trade placed: ${data.buy.longcode}`);
        console.log(`📄 Contract ID: ${data.buy.contract_id}`);
    } else if (data.error) {
        console.error('❌ Error:', data.error.message);
    }
});

ws.on('close', () => {
    console.log('🔌 Disconnected from Deriv API');
});

ws.on('error', (err) => {
    console.error('⚠️ WebSocket Error:', err.message);
});

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
            barrier: trade.barrier,
        },
    };
    console.log(`📈 Placing trade: ${trade.symbol} ${trade.contract_type} ${trade.barrier}`);
    send(contract);
}

function placeBothTrades() {
    placeTrade(TRADE_1);
    placeTrade(TRADE_2);
    setTimeout(() => ws.close(), 5000);
}