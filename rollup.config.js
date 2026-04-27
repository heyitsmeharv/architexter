export default [
  {
    input: "src/index.js",
    output: { file: "dist/index.js", format: "es" },
    external: ["react", "styled-components"],
  },
  {
    input: "src/react/index.js",
    output: { file: "dist/react/index.js", format: "es" },
    external: ["react", "styled-components"],
  },
];
