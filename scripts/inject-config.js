#!/usr/bin/env node
/**
 * Injects config.js (with EXPO_PUBLIC_AUTH_TOKEN from .env) into dist/ and adds
 * a script tag to all HTML files. Run after `npm run build:web`.
 * Enables runtime auth token for web deploy without relying on Metro env inlining.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const ENV_PATH = path.join(ROOT, ".env");

function loadToken() {
  if (!fs.existsSync(ENV_PATH)) return "";
  const env = fs.readFileSync(ENV_PATH, "utf8");
  const match = env.match(/EXPO_PUBLIC_AUTH_TOKEN=(.+)/m);
  if (!match) return "";
  return match[1].trim().replace(/^["']|["']$/g, "");
}

function findHtmlFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) findHtmlFiles(full, files);
    else if (e.name.endsWith(".html")) files.push(full);
  }
  return files;
}

function injectConfigScript(html) {
  const marker = "<head>";
  const inject = '<head><script src="/config.js"></script>';
  if (html.includes('src="/config.js"')) return html;
  return html.replace(marker, inject);
}

const token = loadToken();
if (!token) {
  console.warn("scripts/inject-config.js: EXPO_PUBLIC_AUTH_TOKEN not found in .env, skipping.");
  process.exit(0);
}

// Write config.js
const configJs = `window.__MYUZE_AUTH_TOKEN__="${token.replace(/"/g, '\\"')}";`;
fs.writeFileSync(path.join(DIST, "config.js"), configJs, "utf8");
console.log("Wrote dist/config.js");

// Inject script into all HTML files
const htmlFiles = findHtmlFiles(DIST);
for (const fp of htmlFiles) {
  let html = fs.readFileSync(fp, "utf8");
  html = injectConfigScript(html);
  fs.writeFileSync(fp, html, "utf8");
}
console.log(`Injected config.js script into ${htmlFiles.length} HTML file(s).`);
