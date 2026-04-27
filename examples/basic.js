import {
  parseArchitexter,
  renderArchitexter,
  renderBranches,
  renderFlow,
  renderTree,
} from "../src/index.js";
import { source } from "./source.js";

const model = parseArchitexter(source);

console.log("SOURCE OUTLINE");
console.log(source);

console.log("\nPARSE WARNINGS");
console.log(model.warnings.length ? model.warnings.join("\n") : "No warnings.");

console.log("\nRENDERARCHITEXTER DEFAULT FORMAT");
console.log(renderArchitexter(source));

console.log("\nRENDERARCHITEXTER TREE FORMAT");
console.log(renderArchitexter(source, "tree"));

console.log("\nRENDERARCHITEXTER BRANCHES FORMAT");
console.log(renderArchitexter(source, "branches"));

console.log("\nDIRECT RENDERER EXPORTS");
console.log("\nrenderFlow(model)");
console.log(renderFlow(model));
console.log("\nrenderTree(model)");
console.log(renderTree(model));
console.log("\nrenderBranches(model)");
console.log(renderBranches(model));

const invalidSource = `> Flow annotation without a parent`;
const invalidModel = parseArchitexter(invalidSource);

console.log("\nWARNING EXAMPLE");
console.log(invalidModel.warnings.join("\n"));

console.log("\nREACT EXAMPLE");
console.log("See examples/react.jsx for the React renderer.");
