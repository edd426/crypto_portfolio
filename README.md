# Crypto Portfolio Analyzer

**Status**: ✅ FULLY FUNCTIONAL MVP  
**Last Updated**: May 31, 2025

A web-based cryptocurrency portfolio analyzer that helps users rebalance their holdings according to market capitalization of the top 15 cryptocurrencies, with real-time data from CoinGecko API.

## 🎯 Live Demo

Try it locally in 30 seconds:
```bash
git clone <this-repo>
cd crypto_portfolio
./start-dev.sh
```
Then visit: http://localhost:4200

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- No API keys required (uses CoinGecko free tier)

### Option 1: One-Command Start (Recommended)
```bash
./start-dev.sh
```
This script automatically:
- Installs dependencies for both frontend and backend
- Starts both servers with proper cleanup
- Provides colored status updates

### Option 2: Manual Startup
```bash
# Install dependencies
npm run install:all

# Terminal 1 - Backend (Express.js)
cd backend && npm start

# Terminal 2 - Frontend (Angular)  
cd frontend && npm start
```

### Access the Application
- **Frontend UI**: http://localhost:4200
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/v1/health

### Test the App
Try this sample portfolio:
- **BTC**: 0.5 coins
- **ETH**: 7 coins  
- **Cash**: $800
- Click "Calculate Rebalancing" to see live recommendations!

### Stopping the Application

**If using startup script:**
- Press `Ctrl+C` in the terminal where `./start-dev.sh` is running

**Manual shutdown:**
```bash
# Stop all Node.js processes (frontend + backend)
pkill -f "node"

# Or stop specific processes
pkill -f "ng serve"     # Stop frontend
pkill -f "ts-node-dev"  # Stop backend

# Check if ports are free
lsof -i :3001  # Backend port
lsof -i :4200  # Frontend port
```

## 📊 Features

### Phase 1 (Current MVP)
✅ **Portfolio Entry**: Manually input crypto holdings and USD cash balance  
✅ **Market Cap Rebalancing**: Automatic rebalancing based on top 15 coins by market cap  
✅ **Trade Recommendations**: Exact buy/sell amounts needed for rebalancing  
✅ **URL Persistence**: Save portfolio state in shareable URL parameters  
✅ **Real-time Data**: Live market data from CoinGecko API  
✅ **Visual Charts**: Simple bar charts showing current vs target allocations  
✅ **Detailed Tables**: Trade recommendations and target allocations  

### Example Usage
1. **Enter Holdings**: Add your current crypto positions (e.g., 0.5 BTC, 10 ETH)
2. **Add Cash**: Enter your USD cash balance available for investment
3. **Exclude Coins**: Optionally exclude specific coins from rebalancing
4. **Calculate**: Click "Calculate Rebalancing" to get recommendations
5. **Review Results**: See exact trades needed and target allocations
6. **Share Portfolio**: Generate shareable URL to save your portfolio settings

## 🛠 Technical Architecture

- **Frontend**: Angular 17+ with TypeScript, Angular Material, standalone components
- **Backend**: Express.js with TypeScript, CoinGecko API integration
- **Caching**: 5-minute cache for market data to optimize API usage
- **Deployment Ready**: Designed for Azure cloud deployment (see `/docs`)

## 📱 API Endpoints

### Market Data
- `GET /api/v1/market/top-coins` - Get top cryptocurrencies by market cap
- `GET /api/v1/market/prices` - Get current prices for specific coins
- `GET /api/v1/market/search` - Search for coins by name/symbol

### Portfolio
- `POST /api/v1/rebalance/calculate` - Calculate rebalancing recommendations

### Health
- `GET /api/v1/health` - API health check

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev  # Auto-reload on changes
npm test     # Run tests
npm run lint # Run linting
```

### Frontend Development  
```bash
cd frontend
npx ng serve      # Development server
npx ng build      # Production build
npx ng test       # Run tests
```

## 📈 Example Portfolio Calculation

**Input:**
- 0.5 BTC (~$52,000)
- 10 ETH (~$25,000) 
- $5,000 USD cash
- Total: ~$82,000

**Output:**
- Market cap weighted allocations across top 15 coins
- Specific trade recommendations (e.g., "Sell 6.38 ETH, Buy 0.095 BTC")
- Estimated transaction fees
- Visual comparison of current vs target portfolio

## 🚧 Future Features (Planned)
- Historical backtesting with multiple time periods
- Multiple portfolio management
- CSV import/export
- Exchange API integration
- Mobile responsive design
- Advanced rebalancing strategies

## 📚 Documentation

See `/docs` folder for comprehensive planning:
- `PROJECT_OVERVIEW.md` - High-level architecture and vision
- `TECHNICAL_ARCHITECTURE.md` - API specs and system design
- `PHASE1_REBALANCING.md` - Current MVP feature details
- `PHASE2_BACKTESTING.md` - Future backtesting implementation
- `DEPLOYMENT_INFRASTRUCTURE.md` - Azure deployment with Terraform
- `DEVELOPER_GUIDE.md` - Development setup and guidelines

## 🤝 Contributing

1. Check the planning documents in `/docs`
2. Create feature branch
3. Follow TypeScript and Angular style guides
4. Add tests for new functionality
5. Submit PR for review

## 📄 License

MIT License - see LICENSE file for details

---

**🔥 Ready to optimize your crypto portfolio? Start with `./start-dev.sh` and visit http://localhost:4200!**