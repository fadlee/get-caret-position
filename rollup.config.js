// rollup.config.js
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",
  output: {
    name: "getCaretPosition",
    dir: "lib",
    format: "umd",
  },
  plugins: [typescript()],
};
