import { defineConfig, type UserConfig } from "vite";
import swc from "./src/index.ts";

const config: UserConfig = defineConfig({
  plugins: [
    swc({
      swcOptions: {
        jsc: {
          target: "es2022",
        },
      },
    }),
  ],
});

export default config;
