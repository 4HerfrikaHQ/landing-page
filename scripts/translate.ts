import { execSync } from "child_process";
import { LOCALES } from "../i18n/routing";

const allLocales = LOCALES.map((l) => l.locale).filter((l) => l !== "en");
const isAll = process.argv.includes("--all");
const force = process.argv.includes("--force");
const locale = process.argv.find((arg) => !arg.startsWith("-") && arg !== process.argv[0] && arg !== process.argv[1]);

if (!isAll && !locale) {
  console.error("Usage: bun run translate <locale> [--force]");
  console.error("       bun run translate --all [--force]");
  console.error("");
  console.error("  bun run translate fr          # only missing keys");
  console.error("  bun run translate fr --force  # retranslate everything");
  console.error("  bun run translate --all       # translate all languages");
  process.exit(1);
}

const locales = isAll ? allLocales.join(",") : locale;
const cmd = `bunx gt translate --locales ${locales}${force ? " --force" : ""}`;
console.log(`Running: ${cmd}`);
execSync(cmd, { stdio: "inherit" });
