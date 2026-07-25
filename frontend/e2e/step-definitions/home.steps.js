import { Given, Then, When } from "@cucumber/cucumber";
import { strict as assert } from "node:assert";
import { By, until } from "selenium-webdriver";

Given("que abro la página principal", async function () {
  await this.driver.get(this.baseUrl);
  await this.driver.wait(until.elementLocated(By.css("body")), 10_000);
});

Then("debería ver el título {string}", async function (text) {
  const heading = await this.driver.wait(
    until.elementLocated(By.xpath(`//h1[normalize-space()=${xpathLiteral(text)}]`)),
    10_000,
  );
  assert.equal(await heading.isDisplayed(), true);
});

Then("debería ver el texto {string}", async function (text) {
  const element = await this.driver.wait(
    until.elementLocated(By.xpath(`//*[normalize-space()=${xpathLiteral(text)}]`)),
    10_000,
  );
  assert.equal(await element.isDisplayed(), true);
});

When("hago clic en {string}", async function (label) {
  const button = await this.driver.wait(
    until.elementLocated(By.xpath(`//button[normalize-space()=${xpathLiteral(label)}]`)),
    10_000,
  );
  await button.click();
});

Then("la ruta debería ser {string}", async function (expectedPath) {
  await this.driver.wait(async () => {
    const currentPath = new URL(await this.driver.getCurrentUrl()).pathname;
    return currentPath === expectedPath;
  }, 10_000);

  assert.equal(new URL(await this.driver.getCurrentUrl()).pathname, expectedPath);
});

function xpathLiteral(value) {
  if (!value.includes("'")) return `'${value}'`;
  if (!value.includes('"')) return `"${value}"`;

  return `concat('${value.replaceAll("'", "', \"'\", '")}')`;
}
