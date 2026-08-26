import fs from "node:fs";
import path from "node:path";

const htmlFiles = [
  "index.html",
  "works.html",
  ...fs
    .readdirSync("works")
    .filter((name) => name.endsWith(".html"))
    .map((name) => path.join("works", name)),
];

const missing = [];

function checkReference(file, rawReference) {
  if (
    !rawReference ||
    /^(?:https?:|mailto:|tel:|data:|#|javascript:)/i.test(rawReference)
  ) {
    return;
  }

  let reference = rawReference.split(/[?#]/)[0];
  if (!reference) return;

  try {
    reference = decodeURIComponent(reference);
  } catch {
    // Keep malformed URLs unchanged so they can still be checked as file paths.
  }

  const resolvedPath = path.resolve(path.dirname(file), reference);
  if (!fs.existsSync(resolvedPath)) {
    missing.push(`${file} -> ${reference}`);
  }
}

for (const file of htmlFiles) {
  const source = fs.readFileSync(file, "utf8");

  for (const match of source.matchAll(/(?:src|href)=["']([^"']+)["']/gi)) {
    checkReference(file, match[1]);
  }

  for (const match of source.matchAll(/srcset=["']([^"']+)["']/gi)) {
    for (const candidate of match[1].split(",")) {
      checkReference(file, candidate.trim().split(/\s+/)[0]);
    }
  }
}

const cssFiles = fs
  .readdirSync("assets/css")
  .filter((name) => name.endsWith(".css"))
  .map((name) => path.join("assets/css", name));

for (const file of cssFiles) {
  const source = fs.readFileSync(file, "utf8");
  for (const match of source.matchAll(/url\(["']?([^"')]+)["']?\)/gi)) {
    checkReference(file, match[1]);
  }
}

if (missing.length > 0) {
  console.error(missing.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${htmlFiles.length} pages: all local references resolve.`);
}
