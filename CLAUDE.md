# Solana Stablecoin Analytics Dashboard

## Project Overview

Real-time analytics and visualization platform for tracking stablecoins on the Solana blockchain. Provides comprehensive insights into stablecoin supply, volume, transactions, and global distribution.

**Purpose:** Track and visualize the Solana stablecoin ecosystem with interactive dashboards, charts, and global mapping.

**Tech Stack:** Next.js 16, React 19, TypeScript, Three.js, Recharts, Tailwind CSS

## Data Source

**Primary API:** TopLedger Solana Analytics
- Endpoint: `https://analytics.topledger.xyz/solana/api/queries/14117/results.json`
- API Key: Embedded in DataContext (consider moving to env vars for production)
- Update Frequency: Real-time data with manual refresh capability
- Data Structure: Time-series data with daily granularity for multiple stablecoins

## Key Metrics Tracked

### Aggregate Metrics
- **Total Supply**: Combined circulating supply of all tracked stablecoins (USD value)
- **24h Volume**: Daily transfer volume across all stablecoins
- **24h Transactions**: Total daily transaction count
- **Active Wallets**: Unique daily active addresses interacting with stablecoins
- **Supply Changes**: 7-day and 30-day percentage changes in total supply

### Per-Stablecoin Metrics
- Current supply and historical trends
- Daily transfer volume
- Transaction counts
- Active wallet counts
- Supply change percentages (7d, 30d)
- Historical data for trend analysis

## Tracked Stablecoins

### Fiat-Backed
- **USDC** (Circle) - USD Coin, fully reserved 1:1 USD
- **USDT** (Tether) - Largest stablecoin by market cap
- **PYUSD** (PayPal/Paxos) - PayPal's enterprise stablecoin
- **FDUSD** (First Digital Labs) - Hong Kong-based USD stablecoin
- **USDG** (Paxos) - Singapore MAS-regulated stablecoin
- **EURC** (Circle) - Euro-backed stablecoin

### Crypto-Backed
- **USDS** (Sky/MakerDAO) - Upgraded DAI, overcollateralized
- **AUSD** (Autumn Finance) - Yield-bearing stablecoin
- **ZUSD** (ZUSD Protocol) - DeFi-focused stablecoin

### Algorithmic/Decentralized
- **ISC** (ISC Protocol) - International cross-border payments
- **UXD** (UXD Protocol) - Delta-neutral backed

### RWA-Backed
- **USDY** (Ondo Finance) - Tokenized US Treasuries and bank deposits

### Wrapped/Yield-Bearing
- **YUSDT** - Yield-bearing USDT wrapper
- **YUSDC** - Yield-bearing USDC wrapper

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main dashboard (home)
│   ├── globe/             # Interactive 3D globe view
│   ├── map/               # World map view
│   └── stablecoins/       # Individual stablecoin detail pages
│       ├── page.tsx       # Stablecoin list page
│       └── [slug]/        # Dynamic stablecoin detail view
├── components/            # React components
│   ├── charts/           # Chart components (Recharts)
│   │   ├── DominanceChart.tsx    # Market share pie chart
│   │   ├── HistoryCharts.tsx     # Historical trend charts
│   │   ├── SupplyChart.tsx       # Supply over time
│   │   └── VolumeChart.tsx       # Volume trends
│   ├── Globe.tsx         # Three.js 3D globe visualization
│   ├── WorldMap.tsx      # 2D world map with markers
│   ├── StablecoinTable.tsx # Sortable data table
│   ├── StatCard.tsx      # Metric display cards
│   ├── Navbar.tsx        # Navigation component
│   └── LoadingState.tsx  # Loading/error states
├── context/
│   └── DataContext.tsx   # API data fetching and state management
└── lib/
    ├── api.ts            # API utilities (if needed)
    ├── format.ts         # Number/currency formatting
    └── types.ts          # TypeScript interfaces and constants
```

## Architecture Patterns

### Data Flow
1. **DataContext** fetches from TopLedger API on mount
2. Raw API data is normalized to handle field name variations
3. Data is processed into aggregate metrics and per-coin summaries
4. React Context provides data to all components
5. Components use `useData()` hook to access dashboard data

### Data Normalization Strategy
The API response structure may vary. DataContext includes flexible field mapping:
- Date fields: `date`, `dt`, `day`, `block_date`, `period`
- Supply fields: `daily_supply`, `supply`, `total_supply`, `circulating_supply`
- Volume fields: `daily_transfer_volume`, `transfer_volume`, `volume`
- Transaction fields: `daily_transactions`, `transactions`, `tx_count`, `num_transactions`
- Wallet fields: `daily_active_wallets`, `active_wallets`, `unique_wallets`

### Component Loading Strategy
- Use dynamic imports with `next/dynamic` for heavy components (charts, 3D globe)
- SSR disabled (`ssr: false`) for Three.js and client-side chart libraries
- Custom skeleton loaders for better UX during hydration

## Development Guidelines

### Adding New Stablecoins
1. Add issuer info to `STABLECOIN_ISSUERS` in `src/lib/types.ts`:
   - Include: name, issuer, description, website, chain, type, region, coordinates
   - Types: Fiat-backed, Crypto-backed, Algorithmic, RWA-backed, Wrapped
2. Add color mapping to `STABLECOIN_COLORS` for consistent visualization
3. Ensure API data includes the new token's mint address and symbol
4. Test data normalization for any field name variations

### Adding New Metrics
1. Update `DashboardData` interface in `src/lib/types.ts`
2. Modify `processData()` in `src/context/DataContext.tsx` to calculate new metrics
3. Add corresponding UI components (StatCard, charts, etc.)
4. Update formatting utilities in `src/lib/format.ts` if needed

### Adding New Visualizations
1. Create component in `src/components/` or `src/components/charts/`
2. Use dynamic import in page components to avoid SSR issues
3. Access data via `useData()` hook from DataContext
4. Follow existing patterns for loading states and error handling
5. Use consistent styling with Tailwind classes (glass-card, gradient-text, etc.)

### API Changes
If the TopLedger API structure changes:
1. Update field mapping in `normalizeRow()` function
2. Add new field names to the `findKey()` candidates array
3. Test with real API responses to ensure backward compatibility
4. Update TypeScript interfaces if adding new data fields

## Styling Guidelines

### Solana Brand Colors
- Primary: `#9945FF` (Solana purple)
- Secondary: `#14F195` (Solana green)
- Gradient text: `gradient-text`, `gradient-text-blue`, `gradient-text-green`

### Component Styles
- Glass morphism cards: `glass-card` class
- Consistent spacing: Follow existing padding/margin patterns
- Responsive design: Mobile-first with Tailwind breakpoints (sm, md, lg, xl)
- Dark theme optimized: All components designed for dark backgrounds

### Chart Styling
- Use consistent color palette from `STABLECOIN_COLORS`
- Follow Solana brand guidelines for primary colors
- Maintain readability with proper contrast ratios
- Use Recharts responsive containers for mobile support

## Data Quality Considerations

### Missing Data Handling
- Historical data may be incomplete for newer stablecoins
- Components should gracefully handle missing or zero values
- Use fallbacks: `|| 0` for numbers, `|| ""` for strings
- Display "N/A" or empty states when appropriate

### Date Range Handling
- Support for variable date ranges (API determines available history)
- 7-day and 30-day calculations use available data only
- Latest date is determined from most recent API data point

### Performance Optimization
- Memoize expensive calculations in `processData()`
- Use React.memo for pure components if needed
- Lazy load heavy components (Globe, charts)
- Consider data caching strategy for production (e.g., SWR, React Query)

## Geographic Data

Stablecoin issuers are mapped to geographic coordinates for global visualization:
- **United States**: Circle (USDC, EURC), PayPal/Paxos (PYUSD), Ondo (USDY)
- **British Virgin Islands**: Tether (USDT)
- **Hong Kong**: First Digital Labs (FDUSD)
- **Singapore**: Paxos (USDG)
- **Europe**: Sky/MakerDAO (USDS), Euro Coin (EURC)
- **Global/Decentralized**: Various DeFi protocols (ISC, AUSD, UXD, etc.)

## Interesting Data Points to Track

### Market Dynamics
- Stablecoin dominance shifts (USDC vs USDT market share)
- Growth rates of newer stablecoins (PYUSD, USDG)
- Regional stablecoin adoption patterns
- RWA-backed stablecoin growth (USDY)

### DeFi Activity
- Transaction velocity (volume/supply ratio)
- Active wallet growth trends
- Yield-bearing stablecoin adoption (YUSDC, YUSDT, AUSD)
- Cross-chain bridge activity (if data becomes available)

### Regulatory Impact
- Singapore MAS framework adoption (USDG)
- US regulatory developments impact on supply
- Geographic distribution changes over time

### Ecosystem Health
- Total stablecoin supply as % of Solana TVL
- Transaction count trends (DeFi vs payments)
- Wallet concentration vs decentralization
- New stablecoin launches and adoption rates

## Testing Recommendations

### Unit Tests
- Test data normalization with various API response formats
- Test metric calculations (aggregates, percentage changes)
- Test formatting utilities (currency, numbers)
- Test edge cases: missing data, zero values, negative changes

### Integration Tests
- Test API fetching and error handling
- Test data flow from Context to components
- Test dynamic routing for individual stablecoin pages

### Visual Regression Tests
- Test chart rendering with different data sets
- Test responsive layouts across breakpoints
- Test loading and error states

## Deployment Considerations

### Environment Variables
Move API key to environment variable:
```bash
NEXT_PUBLIC_TOPLEDGER_API_KEY=your_key_here
NEXT_PUBLIC_API_URL=https://analytics.topledger.xyz/...
```

### Performance
- Enable Next.js image optimization
- Consider static generation for stablecoin detail pages
- Implement data caching (Redis, CDN)
- Monitor bundle size (heavy Three.js dependency)

### Monitoring
- Track API response times and errors
- Monitor data freshness (last update timestamp)
- Alert on significant metric changes
- Track user engagement with visualizations

## Future Enhancements

### Data Sources
- Add on-chain data fetching (via Helius, QuickNode, or direct RPC)
- Integrate DeFi protocol TVL data
- Add historical price stability data (peg deviation tracking)
- Include bridge volume data for cross-chain stablecoins

### Visualizations
- Add heat maps for transaction activity
- Show network graphs of stablecoin flows
- Add time-series animations for supply changes
- Create interactive comparison tools

### Analytics
- Add correlation analysis between stablecoins
- Wallet cohort analysis (new vs returning users)
- Market dominance predictions
- Anomaly detection for unusual activity

### Features
- Real-time WebSocket updates
- Custom date range selection
- Export data to CSV/JSON
- Alert system for significant changes
- Portfolio tracking for users

## Security Notes

- Never commit API keys (use .env.local)
- Sanitize user inputs if adding search/filter features
- Rate limit API calls to avoid quota issues
- Validate API responses before processing
- Use HTTPS for all external API calls

## Support and Resources

- **TopLedger Docs**: https://docs.topledger.xyz
- **Solana Docs**: https://docs.solana.com
- **Recharts Docs**: https://recharts.org
- **Three.js Docs**: https://threejs.org/docs

## Contributing

When adding features or fixing bugs:
1. Ensure TypeScript types are properly defined
2. Follow existing component patterns
3. Test with real API data
4. Update this CLAUDE.md if adding new concepts
5. Use semantic commit messages (feat:, fix:, docs:, etc.)
