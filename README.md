# IBEX Flow - Daily Scraper & API

## Structure

- scraper/: Node.js Playwright scraper
- scraper/data/: Daily JSON files
- .github/workflows/: GitHub Actions schedule
- worker/: Cloudflare Worker API

## Usage

### Locally
```bash
cd scraper
npm install
npx playwright install --with-deps
node scrape.js 2025-12-01
