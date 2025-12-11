import { chromium } from "playwright";
import fs from "fs";
import path from "path";

async function scrape(dateISO) {
  const [yyyy, mm, dd] = dateISO.split("-");
  const ibexDate = `${dd}.${mm}.${yyyy}`; // DD.MM.YYYY format for IBEX page

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://ibex.bg/sdac-pv-bg/", { timeout: 60000 });
  await page.waitForSelector("#datePicker", { timeout: 60000 });

  await page.fill("#datePicker", "");
  await page.fill("#datePicker", ibexDate);
  await page.keyboard.press("Enter");

  await page.waitForSelector("#mainTableBody tr", { timeout: 60000 });

  const rows = await page.$$("#mainTableBody tr");
  const result = [];

  for (const row of rows) {
    const cols = await row.$$("td");
    const values = [];
    for (const c of cols) {
      const text = (await c.innerText()).trim();
      values.push(text);
    }
    if (values.length >= 4) {
      result.push({
        product: values[0],
        delivery_period: values[1],
        price_bgn_mwh: values[2],
        total_quantity_mw: values[3]
      });
    }
  }

  await browser.close();
  return result;
}

async function main() {
  const dateISO = process.env.DATE || process.argv[2];
  if (!dateISO) {
    console.error("Missing date. Provide YYYY-MM-DD in DATE env or as first arg.");
    process.exit(1);
  }

  console.log("Scraping date:", dateISO);
  const data = await scrape(dateISO);

  // Ensure folder exists
  const dataDir = path.resolve("data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const output = { [dateISO]: data };
  const filename = path.join(dataDir, `${dateISO}.json`);
  fs.writeFileSync(filename, JSON.stringify(output, null, 4), "utf-8");

  console.log("Saved:", filename, "items:", data.length);
}

if (require.main === module) {
  main().catch(e => {
    console.error(e);
    process.exit(1);
  });
}

export { scrape };
