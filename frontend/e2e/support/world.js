import { setWorldConstructor } from "@cucumber/cucumber";

class AtsWorld {
  constructor({ attach, log }) {
    this.attach = attach;
    this.log = log;
    this.driver = undefined;
    this.baseUrl = (process.env.E2E_BASE_URL || "http://localhost:5173").replace(/\/$/, "");
  }
}

setWorldConstructor(AtsWorld);
