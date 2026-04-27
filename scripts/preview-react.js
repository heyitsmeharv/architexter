import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";

import { source as exampleSource } from "../examples/source.js";
import { parseArchitexter } from "../dist/index.js";
import { ArchitexterVisual } from "../dist/react/index.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const previewDir = resolve(root, ".preview");
const previewFile = resolve(previewDir, "react-tree.html");
const inputPath = process.argv[2] ? resolve(process.argv[2]) : null;

const assertInsideRoot = (target) => {
  const pathFromRoot = relative(root, target);

  if (pathFromRoot.startsWith("..") || isAbsolute(pathFromRoot)) {
    throw new Error(`Refusing to write outside project root: ${target}`);
  }
};

const readSource = () => {
  if (!inputPath) return exampleSource;

  if (!existsSync(inputPath)) {
    throw new Error(`Preview source file not found: ${inputPath}`);
  }

  return readFileSync(inputPath, "utf8");
};

const source = readSource();
const model = parseArchitexter(source);
const sheet = new ServerStyleSheet();

let visualMarkup;
let styleTags;

try {
  visualMarkup = renderToStaticMarkup(
    React.createElement(
      StyleSheetManager,
      { sheet: sheet.instance },
      React.createElement(ArchitexterVisual, { model }),
    ),
  );
  styleTags = sheet.getStyleTags();
} finally {
  sheet.seal();
}

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>architexter React preview</title>
    ${styleTags}
  </head>
  <body>
    ${visualMarkup}
  </body>
</html>
`;

assertInsideRoot(previewDir);
assertInsideRoot(previewFile);
mkdirSync(previewDir, { recursive: true });
writeFileSync(previewFile, html);

console.log(`React preview written to ${relative(root, previewFile)}`);
