import assert from "node:assert/strict";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  parseArchitexter,
  renderArchitexter,
  renderBranches,
  renderFlow,
  renderTree,
} from "../dist/index.js";

const source = `Browser
  App
    > POST /events
    note: Stores accepted events
    Worker -> Database <- Dashboard`;

const run = async () => {
  const model = parseArchitexter(source);

  assert.deepEqual(model.warnings, []);
  assert.equal(model.roots[0].label, "Browser");
  assert.equal(model.roots[0].children[0].label, "App");
  assert.deepEqual(model.roots[0].children[0].annotations, [
    { kind: "flow", value: "POST /events" },
    { kind: "note", value: "Stores accepted events" },
  ]);

  assert.match(renderFlow(model), /POST \/events/);
  assert.match(renderTree(model), /└── App/);
  assert.match(renderBranches(model), /Worker  -->  Database  <--  Dashboard/);
  assert.equal(renderArchitexter(source), renderFlow(model));
  assert.equal(renderArchitexter(source, "tree"), renderTree(model));
  assert.equal(renderArchitexter(source, "branches"), renderBranches(model));

  const duplicateModel = parseArchitexter(`Service
  Worker
  Worker`);

  assert.notEqual(
    duplicateModel.roots[0].children[0].id,
    duplicateModel.roots[0].children[1].id,
  );

  assert.deepEqual(parseArchitexter("> Missing parent").warnings, [
    "Line 1 needs a parent node.",
    "Add at least one node.",
  ]);

  const typedModel = parseArchitexter(`[client] Browser
  App
    [type] service
    [database] Event Store`);

  assert.equal(typedModel.roots[0].label, "Browser");
  assert.equal(typedModel.roots[0].type, "client");
  assert.equal(typedModel.roots[0].children[0].label, "App");
  assert.equal(typedModel.roots[0].children[0].type, "service");
  assert.equal(
    typedModel.roots[0].children[0].children[0].label,
    "Event Store",
  );
  assert.equal(typedModel.roots[0].children[0].children[0].type, "database");

  const main = await import("../dist/index.js");
  const react = await import("../dist/react/index.js");

  assert.equal(typeof main.renderArchitexter, "function");
  assert.equal(typeof react.ArchitexterVisual, "function");
  assert.equal(react.default, react.ArchitexterVisual);

  const visualMarkup = renderToStaticMarkup(
    React.createElement(react.ArchitexterVisual, {
      model,
      className: "custom-tree",
      ariaLabel: "Preview tree",
      showMetaLabels: false,
    }),
  );

  assert.match(visualMarkup, /role="tree"/);
  assert.match(visualMarkup, /aria-label="Preview tree"/);
  assert.match(visualMarkup, /custom-tree/);
  assert.match(visualMarkup, /<details open=""/);
  assert.doesNotMatch(visualMarkup, /aria-expanded/);
  assert.doesNotMatch(visualMarkup, />flow</);

  const collapsedMetaMarkup = renderToStaticMarkup(
    React.createElement(react.ArchitexterVisual, {
      model,
      defaultMetaOpen: false,
    }),
  );

  assert.match(collapsedMetaMarkup, /<details(?:\s|>)/);
  assert.doesNotMatch(collapsedMetaMarkup, /<details open=""/);

  const typedMarkup = renderToStaticMarkup(
    React.createElement(react.ArchitexterVisual, {
      model: typedModel,
      typeColors: { client: "#111827" },
    }),
  );

  assert.match(typedMarkup, />client</);
  assert.match(typedMarkup, />service</);

  const emptyMarkup = renderToStaticMarkup(
    React.createElement(react.ArchitexterVisual, {
      model: { roots: [], warnings: [] },
      emptyLabel: "Nothing to preview.",
    }),
  );

  assert.match(emptyMarkup, /Nothing to preview\./);

  console.log("Smoke tests passed.");
};

await run();
