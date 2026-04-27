import { parseArchitexter } from "../src/index.js";
import { ArchitexterVisual } from "../src/react/index.js";
import { source } from "./source.js";

const model = parseArchitexter(source);

export default function ReactExample() {
  return <ArchitexterVisual model={model} />;
}
