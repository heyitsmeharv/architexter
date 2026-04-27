# architexter

Turn indented text outlines into clean architecture-style text diagrams.

`architexter` is a small ES module for converting outlines into
readable flow, tree, and branch diagrams. It also includes a React renderer for
displaying parsed outlines as a styled visual tree.

It is useful for documenting system architecture, request paths, infrastructure
relationships, and other nested technical structures directly from plain text.

## Installation

```bash
npm install architexter
```

The React renderer expects `react` and `styled-components` to be available in
your application.

## Usage

```js
import { renderArchitexter } from "architexter";

const source = `Browser
  Web Application
    > POST /api/events
    > GET /api/reports
    API Gateway
      (authentication, rate limiting, request routing)
      Application Service
        Write -> Database <- Read
          event records
        Observability`;

console.log(renderArchitexter(source, "flow"));
console.log(renderArchitexter(source, "tree"));
console.log(renderArchitexter(source, "branches"));
```

## React Usage

```jsx
import { parseArchitexter } from "architexter";
import { ArchitexterVisual } from "architexter/react";

const source = `Browser
  Web Application
    > POST /api/events
    API Gateway
      Application Service
        Write -> Database <- Read`;

const model = parseArchitexter(source);

export function ArchitectureDiagram() {
  return <ArchitexterVisual model={model} />;
}
```

## Example

Run the included example from the project root:

```bash
npm run example
```

The example demonstrates the parser, every renderer, supported annotation
prefixes, inline arrows, multiple roots, and warning output.

For the React renderer, see `examples/react.jsx`.

Preview only the React renderer output in a browser before publishing:

```bash
npm run preview:react
```

This writes `.preview/react-tree.html` from the built package output, without
extra wrapper UI. You can also preview a custom outline text file:

```bash
npm run preview:react -- ./path/to/outline.txt
```

## Development

Build the package output:

```bash
npm run build
```

Run the smoke tests:

```bash
npm test
```

Preview the package contents before publishing:

```bash
npm pack --dry-run
```

## Input Format

Use indentation to describe parent-child relationships. Tabs are treated as two
spaces.

```txt
Root node
  Child node
    Grandchild node
```

architexter also supports annotations:

```txt
[service] Service
  > POST /events
  # Validates and stores incoming events
  status: active
  owner: Platform team
  [database] Database
    (Primary event table)
```

Flow annotations can start with `>`, `flow:`, `link:`, `[flow]`, or `[link]`.
Note annotations can start with `#`, `note:`, `[note]`, or be wrapped in
parentheses.

Any custom annotation label is supported using the `label: value` syntax:

```txt
Application Service
  owner: Platform team
  status: active
  warning: deprecated in v3
  sla: 99.9%
```

Custom annotation labels are displayed as coloured chips in the React renderer.
Each unique label is automatically assigned a distinct color.

React node types can be added with a label prefix:

```txt
[client] Browser
  [ui] Web Application
    [gateway] API Gateway
      [service] Application Service
        [database] Event Store
```

You can also set a node type as an indented annotation:

```txt
Application Service
  [type] service
```

Inline arrows are normalized for readability:

```txt
Producer -> Queue <- Worker
```

## Render Formats

```js
renderArchitexter(source, "flow");
renderArchitexter(source, "tree");
renderArchitexter(source, "branches");
```

If no format is provided, architexter renders the `flow` format by default.

## API

```js
import {
  parseArchitexter,
  renderArchitexter,
  renderFlow,
  renderTree,
  renderBranches,
} from "architexter";

import { ArchitexterVisual } from "architexter/react";
```

### `parseArchitexter(outline)`

Parses an indented outline and returns a model with `roots` and `warnings`.

### `renderArchitexter(outline, format)`

Parses and renders an outline in one step. Supported formats are `flow`, `tree`,
and `branches`.

### `renderFlow(model)`, `renderTree(model)`, `renderBranches(model)`

Render a parsed model directly.

### `ArchitexterVisual`

A React component that renders a parsed model as a styled visual tree.

```jsx
<ArchitexterVisual model={parseArchitexter(source)} />
```

The component also accepts `className`, `style`, `ariaLabel`, `emptyLabel`,
`showMetaLabels`, `defaultMetaOpen`, and `typeColors` props for layout,
accessibility, empty-state customization, collapsible annotation display, and
type color overrides.

Node types and annotation labels are automatically assigned distinct colors from
a complementary-harmony palette. Use `typeColors` to override specific type
colors:

```jsx
<ArchitexterVisual
  model={parseArchitexter(source)}
  typeColors={{ database: "#047857" }}
/>
```

## License

MIT
