# Crypto Portfolio Analyzer

**Status**: ✅ Phase 1 DEPLOYED | Phase 2 READY  
**Live Demo**: https://blue-glacier-0ffdf2d1e-preview.westus2.6.azurestaticapps.net

A web-based cryptocurrency portfolio analyzer that helps users rebalance their holdings according to market capitalization. Features configurable portfolio size (1-50 coins), smart coin exclusion, and interactive charts powered by CoinGecko API.

## 🚀 Quick Start

```bash
git clone <this-repo>
cd crypto_portfolio
./start-dev.sh
```
**Access**: http://localhost:4200

## ✨ Features

### Phase 1 (Live)
- 📊 **Market Cap Rebalancing** - Automatic portfolio optimization
- 🎯 **Smart Exclusions** - Text-based coin filtering with visual feedback  
- 📈 **Interactive Charts** - Current vs target allocation comparison
- 💱 **Trade Recommendations** - Exact buy/sell amounts in USD
- 🔗 **URL Persistence** - Shareable portfolio links
- ⚡ **Real-time Data** - Direct CoinGecko API integration with caching

### Phase 2 (Ready for Implementation)
- 📈 **Historical Backtesting** - 5-year performance analysis
- 📊 **Performance Metrics** - Sharpe ratio, max drawdown, returns
- 🔄 **Rebalancing Frequencies** - Monthly/quarterly/yearly options

## 🛠️ Tech Stack

- **Frontend**: Angular 17+ with TypeScript, Material Design
- **API**: Direct CoinGecko integration (no backend required)
- **Hosting**: Azure Static Web App ($0/month operational cost)
- **Testing**: Jest with 70%+ coverage
- **CI/CD**: GitHub Actions

## 📋 For Developers

- **Setup Guide**: See [CONTRIBUTING.md](CONTRIBUTING.md)
- **AI Agent Instructions**: See [CLAUDE.md](CLAUDE.md)
- **Architecture Docs**: See [docs/](docs/) directory

## 🧪 Testing

```bash
./test-all.sh          # Full test suite
npm test               # Quick test run
npm run test:coverage  # Coverage report
```

## 📖 Documentation

- **[Project Overview](docs/PROJECT_OVERVIEW.md)** - High-level architecture
- **[Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)** - System design
- **[Testing Guide](docs/TESTING_GUIDE.md)** - Testing framework details
- **[Phase 2 Backtesting](docs/PHASE2_BACKTESTING.md)** - Implementation roadmap

## 🎯 Cost Optimization

Achieved **99% cost reduction** through client-side architecture:
- **Phase 1**: $0/month (Azure Static Web App free tier)
- **Phase 2**: ~$0.01/month (minimal Azure Function for data updates)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.