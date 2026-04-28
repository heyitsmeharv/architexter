const FLOW_PREFIX = /^(\[flow\]|\[link\]|flow:|link:|>)\s*/i;
const NOTE_PREFIX = /^(\[note\]|note:|#)\s*/i;
const TYPE_PREFIX = /^(\[type\]|type:)\s*/i;
const TYPE_LABEL_PREFIX = /^\[([a-z][a-z0-9 -]{0,31})\]\s+(.+)$/i;
const CUSTOM_ANNOTATION = /^([a-z][a-z0-9-]{0,30}):\s+(.+)$/i;
const WRAPPED_NOTE = /^\((.+)\)$/;
const RESERVED_NODE_TYPES = new Set(["flow", "link", "note", "type"]);

const countIndent = (line) => {
  const leading = line.match(/^[\t ]*/)?.[0] || "";
  return leading.replace(/\t/g, "  ").length;
};

const normalizeNodeType = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-");

const parseNodeLabel = (value) => {
  const typedLabel = value.match(TYPE_LABEL_PREFIX);

  if (!typedLabel) return { label: value, type: null };

  const type = normalizeNodeType(typedLabel[1]);
  const label = typedLabel[2].trim();

  if (!type || !label || RESERVED_NODE_TYPES.has(type)) {
    return { label: value, type: null };
  }

  return { label, type };
};

const createNode = (label, depth, lineNumber, type = null) => ({
  id: `${depth}-${lineNumber}-${label}`,
  label,
  type,
  annotations: [],
  children: [],
});

const parseAnnotation = (value) => {
  const trimmed = value.trim();

  if (FLOW_PREFIX.test(trimmed)) {
    return { kind: "flow", value: trimmed.replace(FLOW_PREFIX, "").trim() };
  }

  if (NOTE_PREFIX.test(trimmed)) {
    return { kind: "note", value: trimmed.replace(NOTE_PREFIX, "").trim() };
  }

  if (TYPE_PREFIX.test(trimmed)) {
    return {
      kind: "nodeType",
      value: normalizeNodeType(trimmed.replace(TYPE_PREFIX, "")),
    };
  }

  const customMatch = trimmed.match(CUSTOM_ANNOTATION);
  if (customMatch) {
    const kind = normalizeNodeType(customMatch[1]);
    if (!RESERVED_NODE_TYPES.has(kind)) {
      return { kind, value: customMatch[2].trim() };
    }
  }

  const wrappedNote = trimmed.match(WRAPPED_NOTE);

  if (wrappedNote) {
    return { kind: "note", value: wrappedNote[1].trim() };
  }

  return null;
};

const findAnnotationParent = (stack, indent) => {
  for (let index = stack.length - 1; index >= 0; index -= 1) {
    if (stack[index].indent < indent) return stack[index].node;
  }

  return stack[stack.length - 1]?.node || null;
};

export const parseArchitexter = (outline = "") => {
  const roots = [];
  const warnings = [];
  const stack = [];

  outline.split(/\r?\n/).forEach((line, lineIndex) => {
    if (!line.trim()) return;

    const indent = countIndent(line);
    const trimmed = line.trim();
    const annotation = parseAnnotation(trimmed);

    if (annotation) {
      const parent = findAnnotationParent(stack, indent);

      if (!parent) {
        warnings.push(`Line ${lineIndex + 1} needs a parent node.`);
        return;
      }

      if (annotation.kind === "nodeType") {
        parent.type = annotation.value || null;
        return;
      }

      parent.annotations.push({
        kind: annotation.kind,
        value: annotation.value,
      });
      return;
    }

    while (stack.length && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1]?.node || null;
    const { label, type } = parseNodeLabel(trimmed);
    const node = createNode(label, stack.length, lineIndex + 1, type);

    if (parent) parent.children.push(node);
    else roots.push(node);

    stack.push({ indent, node });
  });

  if (!roots.length) warnings.push("Add at least one node.");

  return { roots, warnings };
};

const spaces = (count) => " ".repeat(count);

const beautifyInlineArrows = (value) =>
  value.replace(/\s+->\s+/g, "  -->  ").replace(/\s+<-\s+/g, "  <--  ");

const noteLine = (note) => `(${note})`;

const renderTreeNode = (node, prefix = "", isLast = true, isRoot = false) => {
  const lines = [];
  const connector = isLast ? "└── " : "├── ";
  const label = beautifyInlineArrows(node.label);

  lines.push(isRoot ? label : `${prefix}${connector}${label}`);

  const nestedPrefix = isRoot ? "" : `${prefix}${isLast ? "    " : "│   "}`;
  const metaPrefix = isRoot ? "  " : nestedPrefix;

  node.annotations.forEach(({ kind, value }) => {
    if (kind === "flow")
      lines.push(`${metaPrefix}│  ${beautifyInlineArrows(value)}`);
    else if (kind === "note") lines.push(`${metaPrefix}${noteLine(value)}`);
    else lines.push(`${metaPrefix}[${kind}] ${value}`);
  });

  node.children.forEach((child, index) => {
    lines.push(
      ...renderTreeNode(
        child,
        nestedPrefix,
        index === node.children.length - 1,
      ),
    );
  });

  return lines;
};

export const renderTree = (model) =>
  model.roots
    .flatMap((root, index) => [
      ...(index > 0 ? [""] : []),
      ...renderTreeNode(root, "", true, true),
    ])
    .join("\n");

const renderBranchSubtree = (node, prefix, lines) => {
  node.annotations.forEach(({ kind, value }) => {
    if (kind === "flow")
      lines.push(`${prefix}│  ${beautifyInlineArrows(value)}`);
    else if (kind === "note") lines.push(`${prefix}${noteLine(value)}`);
    else lines.push(`${prefix}[${kind}] ${value}`);
  });

  node.children.forEach((child, index) => {
    const isLast = index === node.children.length - 1;
    const connector = isLast ? "└── " : "├── ";
    const childPrefix = `${prefix}${isLast ? "    " : "│   "}`;

    lines.push(`${prefix}${connector}${beautifyInlineArrows(child.label)}`);
    renderBranchSubtree(child, childPrefix, lines);
  });
};

const renderFlowBranches = (children, indent, lines) => {
  children.forEach((child, index) => {
    const isLast = index === children.length - 1;
    const connector = isLast ? "└── " : "├── ";
    const prefix = spaces(indent);
    const childPrefix = `${prefix}${isLast ? "    " : "│   "}`;

    lines.push(`${prefix}${connector}${beautifyInlineArrows(child.label)}`);
    renderBranchSubtree(child, childPrefix, lines);

    if (!isLast) lines.push(`${prefix}│`);
  });
};

const renderFlowNode = (node, indent, lines) => {
  lines.push(`${spaces(indent)}${beautifyInlineArrows(node.label)}`);

  node.annotations
    .filter((a) => a.kind !== "flow")
    .forEach(({ kind, value }) => {
      if (kind === "note") lines.push(`${spaces(indent)}${noteLine(value)}`);
      else lines.push(`${spaces(indent)}[${kind}] ${value}`);
    });

  const flowAnnotations = node.annotations.filter((a) => a.kind === "flow");
  if (flowAnnotations.length) {
    lines.push(`${spaces(indent + 2)}│`);
    flowAnnotations.forEach(({ value }) => {
      lines.push(`${spaces(indent + 2)}│  ${beautifyInlineArrows(value)}`);
    });
  }

  if (node.children.length === 1) {
    lines.push(`${spaces(indent + 2)}│`);
    lines.push(`${spaces(indent + 2)}↓`);
    renderFlowNode(node.children[0], indent, lines);
    return;
  }

  if (node.children.length > 1) {
    lines.push(`${spaces(indent + 2)}│`);
    renderFlowBranches(node.children, indent + 2, lines);
  }
};

export const renderFlow = (model) => {
  const lines = [];

  model.roots.forEach((root, index) => {
    if (index > 0) lines.push("");
    renderFlowNode(root, 0, lines);
  });

  return lines.join("\n");
};

const collectBranches = (node, path = []) => {
  const nextPath = [...path, node.label];

  if (!node.children.length) return [nextPath];

  return node.children.flatMap((child) => collectBranches(child, nextPath));
};

export const renderBranches = (model) => {
  const branches = model.roots.flatMap((root) => collectBranches(root));

  return branches
    .map((branch, index) => {
      const connector = index === branches.length - 1 ? "`-- " : "|-- ";
      return `${connector}${branch.map(beautifyInlineArrows).join("  -->  ")}`;
    })
    .join("\n");
};

export const renderArchitexter = (outline, format = "flow") => {
  const model = parseArchitexter(outline);

  if (format === "tree") return renderTree(model);
  if (format === "branches") return renderBranches(model);

  return renderFlow(model);
};
