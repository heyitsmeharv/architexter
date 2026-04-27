import React from "react";
import styledComponents from "styled-components";

const styled = styledComponents.default || styledComponents;

const LEVEL_COLORS = ["#2563eb", "#7c3aed", "#db2777", "#ea580c", "#0f766e"];
// 6 complementary pairs — each row is a colour opposite its partner on the wheel
const COLOR_PALETTE = [
  {
    solid: "#dc2626",
    border: "#fca5a5",
    fill: "#fef2f2",
    text: "#7f1d1d",
    tag: "#b91c1c",
  }, // red
  {
    solid: "#0891b2",
    border: "#67e8f9",
    fill: "#ecfeff",
    text: "#164e63",
    tag: "#0e7490",
  }, // cyan       ← complement of red
  {
    solid: "#ea580c",
    border: "#fdba74",
    fill: "#fff7ed",
    text: "#7c2d12",
    tag: "#c2410c",
  }, // orange
  {
    solid: "#2563eb",
    border: "#93c5fd",
    fill: "#eff6ff",
    text: "#1e3a8a",
    tag: "#1d4ed8",
  }, // blue       ← complement of orange
  {
    solid: "#ca8a04",
    border: "#fde047",
    fill: "#fefce8",
    text: "#713f12",
    tag: "#a16207",
  }, // yellow
  {
    solid: "#7c3aed",
    border: "#c4b5fd",
    fill: "#f5f3ff",
    text: "#2e1065",
    tag: "#6d28d9",
  }, // violet     ← complement of yellow
  {
    solid: "#0ea5e9",
    border: "#7dd3fc",
    fill: "#f0f9ff",
    text: "#0c4a6e",
    tag: "#0369a1",
  }, // sky blue
  {
    solid: "#9333ea",
    border: "#d8b4fe",
    fill: "#faf5ff",
    text: "#3b0764",
    tag: "#7e22ce",
  }, // purple     ← complement of lime
  {
    solid: "#16a34a",
    border: "#86efac",
    fill: "#f0fdf4",
    text: "#14532d",
    tag: "#15803d",
  }, // green
  {
    solid: "#c026d3",
    border: "#f0abfc",
    fill: "#fdf4ff",
    text: "#4a044e",
    tag: "#a21caf",
  }, // fuchsia    ← complement of green
  {
    solid: "#0d9488",
    border: "#5eead4",
    fill: "#f0fdfa",
    text: "#134e4a",
    tag: "#0f766e",
  }, // teal
  {
    solid: "#e11d48",
    border: "#fda4af",
    fill: "#fff1f2",
    text: "#881337",
    tag: "#be123c",
  }, // rose       ← complement of teal
];

const collectAllColorKeys = (nodes) => {
  const keys = new Set();
  const visit = (node) => {
    if (node.type) keys.add(node.type);
    node.annotations.forEach(({ kind }) => keys.add(kind));
    node.children.forEach(visit);
  };
  nodes.forEach(visit);
  return [...keys].sort();
};

const buildColorMap = (keys) => {
  const map = {};
  keys.forEach((key, index) => {
    map[key] = COLOR_PALETTE[index % COLOR_PALETTE.length];
  });
  return map;
};

const getNodeColor = (level, type, typeColors, colorMap) => {
  if (!type) return LEVEL_COLORS[level % LEVEL_COLORS.length];
  return (
    typeColors?.[type] ||
    colorMap[type]?.solid ||
    LEVEL_COLORS[level % LEVEL_COLORS.length]
  );
};

const formatLabel = (value) =>
  value.replace(/\s+->\s+/g, "  ->  ").replace(/\s+<-\s+/g, "  <-  ");

const Canvas = styled.div`
  padding: 1.8rem;
  overflow-x: auto;
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  background: #f8fafc;
  border: 1px solid #d8e0ea;
  border-radius: 8px;
`;

const TreeList = styled.ul`
  min-width: max-content;
  margin: 0;
  padding: ${({ $root }) => ($root ? "0" : "0 0 0 2.8rem")};
  list-style: none;
  position: relative;

  ${({ $root }) =>
    !$root &&
    `
      margin-left: 2rem;
      border-left: 2px solid #cbd5e1;
    `}
`;

const TreeItem = styled.li`
  position: relative;
  margin: ${({ $root }) => ($root ? "0" : "0.85rem 0")};

  ${({ $root }) =>
    !$root &&
    `
      &::before {
        content: "";
        position: absolute;
        top: 1.65rem;
        left: -2.8rem;
        width: 2rem;
        border-top: 2px solid #cbd5e1;
      }
    `}
`;

const NodeLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  max-width: 20rem;
  min-height: 3.25rem;
  padding: 0.62rem 1rem 0.62rem 0.75rem;
  border: 1px solid #d8e0ea;
  border-left: 0.45rem solid ${({ $color }) => $color};
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 0.45rem 1.15rem rgba(15, 23, 42, 0.08);
  color: #243042;
  font-family: ui-rounded, "Aptos Display", "Segoe UI", system-ui, sans-serif;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.4;
  text-align: left;
  overflow-wrap: anywhere;
`;

const LevelDot = styled.span`
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const NodeText = styled.span`
  flex: 1 1 auto;
  min-width: 0;
`;

const TypeBadge = styled.span`
  margin-left: auto;
  padding: 0.2rem 0.45rem;
  border-radius: 5px;
  background: ${({ $color }) => $color};
  color: #ffffff;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
`;

const MetaDisclosure = styled.details`
  max-width: 36rem;
  margin: 0.65rem 0 0.75rem 2.8rem;

  &[open] summary {
    margin-bottom: 0.5rem;
  }
`;

const MetaSummary = styled.summary`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  color: #475569;
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.35;
  user-select: none;

  &::marker {
    color: #64748b;
  }
`;

const MetaList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const MetaItem = styled.li`
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  max-width: 100%;
  padding: 0.38rem 0.55rem;
  border: 1px solid ${({ $colors }) => $colors.border};
  border-radius: 6px;
  background: ${({ $colors }) => $colors.fill};
  color: ${({ $colors }) => $colors.text};
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.35;
  overflow-wrap: anywhere;
`;

const MetaTag = styled.span`
  padding: 0.18rem 0.42rem;
  border-radius: 4px;
  background: ${({ $colors }) => $colors.tag};
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
  line-height: 1;
  flex-shrink: 0;
`;

const EmptyState = styled.div`
  max-width: 34rem;
  padding: 1rem;
  border: 1px dashed #94a3b8;
  border-radius: 8px;
  background: #ffffff;
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.45;
`;

const h = React.createElement;

const getMetaSummary = (node) => {
  const counts = node.annotations.reduce((acc, { kind }) => {
    acc[kind] = (acc[kind] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([kind, count]) => `${count} ${kind}${count === 1 ? "" : "s"}`)
    .join(", ");
};

const BranchNode = ({
  node,
  root = false,
  level = 0,
  showMetaLabels = true,
  defaultMetaOpen = true,
  typeColors,
  colorMap,
}) => {
  const color = getNodeColor(level, node.type, typeColors, colorMap);

  return h(
    TreeItem,
    {
      $root: root,
      role: "treeitem",
      "aria-level": level + 1,
    },
    h(
      NodeLabel,
      { $color: color },
      h(LevelDot, { $color: color, "aria-hidden": true }),
      h(NodeText, null, formatLabel(node.label)),
      node.type && h(TypeBadge, { $color: color }, node.type),
    ),
    node.annotations.length > 0 &&
      h(
        MetaDisclosure,
        { open: defaultMetaOpen ? true : undefined },
        h(MetaSummary, null, getMetaSummary(node)),
        h(
          MetaList,
          { role: "list", "aria-label": `${node.label} annotations` },
          ...node.annotations.map(({ kind, value }, index) => {
            const colors = colorMap[kind];
            return h(
              MetaItem,
              { key: `${kind}-${index}-${value}`, $colors: colors },
              showMetaLabels && h(MetaTag, { $colors: colors }, kind),
              h("span", null, formatLabel(value)),
            );
          }),
        ),
      ),
    node.children.length > 0 &&
      h(
        TreeList,
        { role: "group" },
        ...node.children.map((child) =>
          h(BranchNode, {
            key: child.id,
            node: child,
            level: level + 1,
            showMetaLabels,
            defaultMetaOpen,
            typeColors,
            colorMap,
          }),
        ),
      ),
  );
};

const ArchitexterVisual = ({
  model,
  className,
  style,
  ariaLabel = "Architecture tree",
  emptyLabel = "No architecture nodes to display.",
  showMetaLabels = true,
  defaultMetaOpen = true,
  typeColors,
}) => {
  const colorMap = buildColorMap(collectAllColorKeys(model.roots));

  return h(
    Canvas,
    {
      className,
      style,
      role: "tree",
      "aria-label": ariaLabel,
    },
    model.roots.length > 0
      ? h(
          TreeList,
          { $root: true, role: "presentation" },
          ...model.roots.map((root) =>
            h(BranchNode, {
              key: root.id,
              node: root,
              root: true,
              level: 0,
              showMetaLabels,
              defaultMetaOpen,
              typeColors,
              colorMap,
            }),
          ),
        )
      : h(EmptyState, null, emptyLabel),
  );
};

export default ArchitexterVisual;
