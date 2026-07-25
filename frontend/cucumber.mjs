export default {
  paths: ["e2e/features/**/*.feature"],
  import: [
    "e2e/support/**/*.js",
    "e2e/step-definitions/**/*.js",
  ],
  format: [
    "progress-bar",
    "html:e2e/reports/cucumber-report.html",
    "json:e2e/reports/cucumber-report.json",
  ],
  formatOptions: { snippetInterface: "async-await" },
  publishQuiet: true,
};
