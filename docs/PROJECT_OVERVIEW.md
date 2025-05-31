# Crypto Portfolio Analyzer - Project Overview

## Vision
A web-based cryptocurrency portfolio analyzer that helps users rebalance their holdings according to market capitalization of the top 15 cryptocurrencies, with advanced backtesting capabilities to optimize portfolio performance.

## Core Principles
- **Simplicity First**: Start with minimal features and expand based on user needs
- **Cost-Effective**: Minimize infrastructure and data storage costs
- **Anonymous**: No user authentication or personal data storage
- **Data-Driven**: Make rebalancing decisions based on real market data
- **Desktop-First**: Optimize for desktop users initially

## Project Phases

### Phase 1: Portfolio Rebalancing (MVP)
- Manual portfolio entry with current holdings
- Market cap-based rebalancing for top 15 cryptocurrencies
- URL-based portfolio saving (via parameters)
- Exact trade recommendations
- Basic portfolio metrics display

### Phase 2: Backtesting Engine
- Historical performance analysis
- Multiple rebalancing frequencies
- Configurable transaction fees and slippage
- Performance comparison vs HODL strategy
- Advanced metrics (Sharpe ratio, max drawdown, etc.)

### Future Phases
- Multiple portfolio management
- CSV import/export
- Purchase price tracking
- Mobile-responsive design
- Alternative rebalancing strategies
- Multi-currency support
- API integrations with exchanges

## Technical Stack

### Frontend
- **Framework**: Angular (latest stable version)
- **UI Library**: Angular Material for consistent desktop-first design
- **Charts**: Chart.js or D3.js for portfolio visualizations
- **State Management**: NgRx for complex state handling

### Backend
- **Runtime**: Node.js with TypeScript
- **API Framework**: NestJS (Angular-like architecture for consistency)
- **API Gateway**: Azure API Management
- **Serverless Functions**: Azure Functions for API calls and calculations

### Infrastructure
- **Cloud Provider**: Azure
- **Hosting**: Azure Static Web Apps (frontend) + Azure Functions (backend)
- **CDN**: Azure CDN for static assets
- **IaC**: Terraform for infrastructure management
- **CI/CD**: GitHub Actions

### Data & APIs
- **Market Data**: CoinGecko API (free tier initially)
- **Caching**: Azure Redis Cache for API responses
- **Storage**: Azure Blob Storage for any persistent data needs

## Success Metrics
- Portfolio rebalancing accuracy
- Backtesting calculation performance
- Page load times < 2 seconds
- API response times < 500ms
- Monthly Azure costs < $50