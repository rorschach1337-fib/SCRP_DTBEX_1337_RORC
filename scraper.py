import json
import os
import time
from playwright.sync_api import sync_playwright
from datetime import datetime, timedelta

MAX_RETRIES = 12        # 12 × 5 min = 60 min
RETRY_DELAY = 300      # seconds


def scrape_once(ibex_date):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        page.goto("https://ibex.bg/sdac-pv-bg/", timeout=60000)
        page.wait_for_selector("#datePicker")

        page.fill("#datePicker", "")
        page.fill("#datePicker", ibex_date)
        page.keyboard.press("Enter")

        page.wait_for_selector("#mainTableBody tr", timeout=60000)
        time.sleep(2)

        rows = page.query_selector_all("#mainTableBody tr")
        result = []

        for row in rows:
            cols = row.query_selector_all("td")
            values = [c.inner_text().strip() for c in cols]

            if len(values) >= 4:
                result.append({
                    "product": values[0],
                    "delivery_period": values[1],
                    "price_bgn_mwh": values[2],
                    "total_quantity_mw": values[3]
                })

        browser.close()
        return result


def scrape_with_retry(ibex_date):
    for attempt in range(1, MAX_RETRIES + 1):
        print(f"Attempt {attempt}/{MAX_RETRIES}")
        data = scrape_once(ibex_date)

        if data:
            print("✅ Data ready")
            return data

        print("⏳ Not ready, retrying...")
        time.sleep(RETRY_DELAY)

    raise RuntimeError("IBEX data not published")


if __name__ == "__main__":
    target_date = datetime.now() + timedelta(days=1)
    date_str = target_date.strftime("%Y-%m-%d")
    ibex_date = target_date.strftime("%d.%m.%Y")

    os.makedirs("data", exist_ok=True)

    data = scrape_with_retry(ibex_date)

    with open(f"data/{date_str}.json", "w", encoding="utf-8") as f:
        json.dump({date_str: data}, f, indent=4, ensure_ascii=False)

    print("Saved:", date_str)
