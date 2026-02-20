# Database Setup

This project uses SQLite to cache stablecoin data locally, improving performance and hiding API keys.

## Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run initial data import:**
   ```bash
   npm run update-data
   ```

   This fetches data from TopLedger API and populates the SQLite database.

## Database Schema

### `stablecoin_data` table
Stores historical stablecoin metrics:
- `date` - Trading date (YYYY-MM-DD)
- `mint_address` - Solana token mint address
- `mint_name` - Token name/symbol
- `holders` - Number of unique holders
- `volume` - Daily transfer volume (USD)
- `p2p_volume` - Peer-to-peer volume (USD)
- `transactions` - Number of transactions (fee payers)

### `data_updates` table
Tracks update history:
- `last_update` - Timestamp of last update
- `records_updated` - Number of records inserted/updated
- `status` - Update status (success/failure)

## Updating Data

### Manual Update
Run anytime to refresh data:
```bash
npm run update-data
```

### Automatic Updates (Development)
The app automatically updates data every 6 hours when running in development mode with `npm run dev`.

### Automatic Updates (Production)

#### Option 1: Built-in Cron (Simple)
The app includes a cron job that runs every 6 hours. Just deploy and it works.

#### Option 2: External Cron (Recommended for Serverless)
For serverless platforms (Vercel, Netlify), use external cron:

1. Set `UPDATE_SECRET` in your environment variables
2. Set up a cron service (GitHub Actions, cron-job.org, etc.) to call:
   ```bash
   curl -X POST https://your-domain.com/api/update \
     -H "Authorization: Bearer your-secret-key"
   ```

**Example GitHub Action** (`.github/workflows/update-data.yml`):
```yaml
name: Update Stablecoin Data
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Manual trigger

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Update
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/update \
            -H "Authorization: Bearer ${{ secrets.UPDATE_SECRET }}"
```

## API Endpoints

### GET `/api/stablecoins`
Returns all cached stablecoin data:
```json
{
  "data": [...],
  "lastUpdate": "2026-02-20T23:05:58.000Z",
  "count": 3087
}
```

### POST `/api/update`
Triggers data update (requires authentication):
```bash
curl -X POST http://localhost:3000/api/update \
  -H "Authorization: Bearer dev-secret"
```

### GET `/api/update` (Dev only)
Test endpoint for development - triggers update without auth.

## Database Location

SQLite database is stored at:
```
/data/stablecoins.db
```

The database file is git-ignored but persists locally and in production deployments.

## Troubleshooting

**No data showing?**
1. Check if database exists: `ls -la data/`
2. Run manual update: `npm run update-data`
3. Check API: `curl http://localhost:3000/api/stablecoins | jq .count`

**Update failing?**
- Check TopLedger API key is valid
- Verify network connectivity
- Check logs in terminal

**Database locked?**
- Close any other processes accessing the DB
- Delete `data/stablecoins.db-wal` and `data/stablecoins.db-shm`
- Restart the app
