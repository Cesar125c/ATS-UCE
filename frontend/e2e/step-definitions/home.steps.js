import { Given, Then, When } from "@cucumber/cucumber";
import { strict as assert } from "node:assert";
import { By, until } from "selenium-webdriver";
import { Select } from "selenium-webdriver/lib/select.js";

Given("que abro la página principal", async function () {
  await this.driver.get(this.baseUrl);
  await this.driver.wait(until.elementLocated(By.css("body")), 10_000);
});

Given("que abro la página de registro", async function () {
  await this.driver.get(`${this.baseUrl}/sign-up`);
  await this.driver.wait(
    until.elementLocated(By.xpath("//h3[normalize-space()='Create your account']")),
    10_000,
  );
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

Then("debería ver un error en el campo {string}", async function (fieldName) {
  const field = await this.driver.findElement(By.name(fieldName));
  const error = await field.findElement(By.xpath("following-sibling::p[1]"));
  assert.equal(await error.isDisplayed(), true);
  assert.notEqual((await error.getText()).trim(), "");
});

When("hago clic en {string}", async function (label) {
  const button = await this.driver.wait(
    until.elementLocated(By.xpath(`//button[normalize-space()=${xpathLiteral(label)}]`)),
    10_000,
  );
  await button.click();
});

When("completo los datos de registro como postulante", async function () {
  await fillRegistrationFields(this, {
    firstName: "Ana",
    lastName: "Pérez",
    email: "ana.perez@example.com",
    role: "applicant",
  });
});

When(
  "completo los datos de registro como recursos humanos con correo {string}",
  async function (email) {
    await fillRegistrationFields(this, {
      firstName: "Carlos",
      lastName: "Mendoza",
      email,
      role: "human_resources",
    });
  },
);

When(
  "ingreso la contraseña {string} y la confirmación {string}",
  async function (password, confirmation) {
    await this.driver.findElement(By.name("password")).sendKeys(password);
    await this.driver.findElement(By.name("confirmPassword")).sendKeys(confirmation);
  },
);

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

async function fillRegistrationFields(world, { firstName, lastName, email, role }) {
  await world.driver.findElement(By.name("firstName")).sendKeys(firstName);
  await world.driver.findElement(By.name("lastName")).sendKeys(lastName);
  await world.driver.findElement(By.name("email")).sendKeys(email);

  const roleSelect = new Select(await world.driver.findElement(By.name("role")));
  await roleSelect.selectByValue(role);
}
