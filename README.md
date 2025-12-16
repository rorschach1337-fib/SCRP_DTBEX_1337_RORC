Here’s a **ready-to-use `README.md`** for your GitHub repo describing your IBEX scraper with Telegram notifications:

---

# IBEX PV Data Scraper

A Python scraper to automatically fetch daily electricity market data from [IBEX](https://ibex.bg/sdac-pv-bg/) and save it as JSON. Includes **Telegram notifications** on success or failure.

---

## Features

* Scrapes IBEX daily data for **solar PV products**.
* Automatically retries if data is not yet published (up to 1 hour with 5-min intervals).
* Saves data in:

  * `data/YYYY-MM-DD.json` (daily snapshot)
  * `data/latest.json` (latest data)
  * `data/index.json` (all available dates)
* Sends Telegram notifications for:

  * ✅ Successful scrape
  * ⚠️ Failed scrape

---

## Requirements

* Python 3.11+
* Libraries:

  ```bash
  pip install playwright requests
  ```
* Playwright browsers (install after first install):

  ```bash
  playwright install
  ```

---

## Setup

1. **Clone the repo**

   ```bash
   git clone <your-repo-url>
   cd <repo-folder>
   ```

2. **Configure Telegram**

   * Create a bot with [@BotFather](https://t.me/BotFather) and get your **TOKEN**.
   * Get your **chat ID** by messaging your bot and checking:

     ```
     https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
     ```
   * Update `scraper.py` with your **TOKEN** and **CHAT_ID**.

3. **Install dependencies**

   ```bash
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   playwright install
   ```

---

## Usage

Run the scraper manually:

```bash
python scraper.py
```

The scraper will:

1. Open the IBEX website in **non-headless browser**.
2. Select the date for **tomorrow**.
3. Collect all PV product data.
4. Retry every 5 minutes if the data is not available yet (up to 12 attempts).
5. Save JSON files in `data/`.
6. Send a Telegram notification on success or failure.

---

## Output

* **Daily JSON**: `data/YYYY-MM-DD.json`
* **Latest JSON**: `data/latest.json`
* **Index JSON**: `data/index.json`
  Example of `index.json`:

```json
{
    "count": 3,
    "dates": ["2025-12-14", "2025-12-15", "2025-12-16"]
}
```

---

## Optional: GitHub Actions

You can automate the scraper daily using GitHub Actions:

```yaml
name: IBEX Scraper

on:
  schedule:
    - cron: '15 14 * * *'  # every day at 14:15 UTC
  workflow_dispatch:

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          playwright install

      - name: Run scraper
        run: xvfb-run python scraper.py
        env:
          TELEGRAM_TOKEN: ${{ secrets.TELEGRAM_TOKEN }}
          TELEGRAM_CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}
```

---

## Notes

* The scraper uses **Playwright in non-headless mode** for better compatibility with the IBEX site.
* Make sure your bot token and chat ID are correct, or Telegram notifications will fail.
* Adjust `MAX_RETRIES` and `RETRY_DELAY` if needed.

---

## License

MIT License – free to use and modify.

