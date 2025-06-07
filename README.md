# Crypto Portfolio Analyzer

**Status**: ✅ ARCHITECTURE OPTIMIZED - READY FOR DEPLOYMENT  
**Last Updated**: June 7, 2025

> **🔄 PROJECT HANDOFF**: Architecture decisions finalized. Next developer should implement the optimized client-side approach. See [CLAUDE.md](CLAUDE.md) for detailed implementation tasks.

A web-based cryptocurrency portfolio analyzer that helps users rebalance their holdings according to market capitalization with configurable portfolio size (1-50 coins), smart coin exclusion with visual feedback, enhanced allocations view, and interactive charts powered by CoinGecko API.

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

### Phase 1 (Current MVP + Advanced Features)
✅ **Smart Portfolio Entry**: Manual input with text-based coin exclusion and visual effectiveness feedback  
✅ **Configurable Portfolio Size**: User-defined max coins (1-50) with exclusions counting against limit  
✅ **Interactive Charts**: Proportional bar charts with hover tooltips showing current vs target composition  
✅ **Enhanced Allocations View**: Complete current vs target comparison with cash holdings included  
✅ **Market Cap Rebalancing**: Automatic rebalancing based on user-defined top X coins by market cap  
✅ **Smart Exclusion System**: Real-time feedback showing effective vs ineffective exclusions  
✅ **Trade Recommendations**: Exact buy/sell amounts with comprehensive transaction details  
✅ **Clean URL Persistence**: Portfolio state saved in shareable URLs without timestamps  
✅ **Robust API Handling**: Rate limiting awareness with user-friendly error messages  
✅ **Real-time Data**: Live market data from CoinGecko API with enhanced error handling  
✅ **Debug System**: Configurable verbosity levels (0-4) for troubleshooting  
✅ **Professional UI**: Angular Material design with consolidated button layout  

### Example Usage
1. **Enter Holdings**: Add your current crypto positions (e.g., 0.5 BTC, 10 ETH)
2. **Set Portfolio Size**: Choose max coins for target portfolio (default: 15, range: 1-50)
3. **Add Cash**: Enter your USD cash balance available for investment
4. **Exclude Coins**: Type comma-separated symbols (e.g., "BTC, USDT, USDC") to exclude from rebalancing
5. **Calculate**: Click "Calculate Rebalancing" to get recommendations with exclusion effectiveness feedback
6. **Review Results**: See current vs target allocations, exact trades needed, and cash holdings
7. **Share Portfolio**: Generate clean, shareable URL to save your portfolio settings

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
- 0.1 BTC (~$5,200)
- 2 ETH (~$5,000) 
- 1000 ADA (~$500)
- $500 USD cash
- Max Coins: 10
- Excluded: "BTC, USDT, USDC"
- Total: ~$11,200

**Output:**
- Market cap weighted allocations across top 10 coins (excluding specified coins)
- Exclusion feedback: BTC shows as "effective" (green), USDT/USDC as "ineffective" (yellow)
- Current vs target comparison table with cash holdings included
- Specific trade recommendations with USD values
- Interactive charts showing proportional portfolio composition
- Clean shareable URL for portfolio state

## 🚀 Next Steps

### 🎯 **IMMEDIATE PRIORITY: Azure Production Deployment**
The application is **production-ready** and waiting for robust Azure deployment. Complete infrastructure planning and Terraform configurations are available in `/docs/DEPLOYMENT_INFRASTRUCTURE.md`.

### Future Features (Post-Deployment)
- Historical backtesting with multiple time periods
- Multiple portfolio management
- CSV import/export
- Exchange API integration
- Mobile responsive design
- Advanced rebalancing strategies

## 📚 Documentation

### For Users
- This **README.md** - Getting started and features overview

### For Developers
- `CLAUDE.md` - Complete project status and AI agent guidance
- `/docs/DEVELOPER_GUIDE.md` - Development setup and workflows
- `/docs/TESTING_GUIDE.md` - Comprehensive testing documentation
- `/docs/TECHNICAL_ARCHITECTURE.md` - API specifications and system design
- `/docs/DEPLOYMENT_INFRASTRUCTURE.md` - Production deployment planning

### For Project Planning
- `/docs/PROJECT_OVERVIEW.md` - High-level vision and architecture
- `/docs/PHASE2_BACKTESTING.md` - Future feature roadmap
- `/docs/FUTURE_FEATURES.md` - Long-term feature planning

## 🤝 Contributing

1. Review `/docs/DEVELOPER_GUIDE.md` for setup and conventions
2. Run `./test-all.sh` before committing
3. Follow TypeScript and Angular style guides
4. Maintain 70%+ test coverage
5. Update documentation for new features

## 📄 License

MIT License - see LICENSE file for details

---

**🔥 Ready to optimize your crypto portfolio? Start with `./start-dev.sh` and visit http://localhost:4200!**