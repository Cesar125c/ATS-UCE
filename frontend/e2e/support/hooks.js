import { After, Before, Status, setDefaultTimeout } from "@cucumber/cucumber";
import { Builder } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import chromedriver from "chromedriver";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

setDefaultTimeout(Number(process.env.E2E_TIMEOUT_MS || 20_000));

Before(async function () {
  const options = new chrome.Options();

  if (process.env.E2E_HEADLESS !== "false") {
    options.addArguments("--headless=new");
  }

  options.addArguments(
    "--window-size=1440,1000",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--no-sandbox",
    "--log-level=3",
  );

  this.driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .setChromeService(new chrome.ServiceBuilder(chromedriver.path))
    .build();
});

After(async function ({ pickle, result }) {
  if (!this.driver) return;

  const screenshot = Buffer.from(await this.driver.takeScreenshot(), "base64");
  const screenshotDirectory = path.resolve("e2e/reports/screenshots");
  const scenarioName = pickle.name
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .replaceAll(/[^a-zA-Z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "")
    .toLowerCase();

  await mkdir(screenshotDirectory, { recursive: true });
  await writeFile(path.join(screenshotDirectory, `${scenarioName}.png`), screenshot);
  await this.attach(screenshot, "image/png");

  if (result?.status === Status.FAILED) {
    this.log(`El escenario "${pickle.name}" falló; se adjuntó la evidencia visual.`);
  }

  await this.driver.quit();
});
