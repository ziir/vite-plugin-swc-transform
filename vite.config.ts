import { defineConfig } from "vite";
import swc from "./src/index";

export default defineConfig({
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
