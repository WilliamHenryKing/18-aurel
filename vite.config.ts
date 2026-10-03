import tailwind from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
export default defineConfig({
 plugins: [react(), tailwind()],
 server: {host: "127.0.0.1", port: 4528, strictPort: true, watch: {ignored: ["**/output/**"]}},
 preview: {host: "127.0.0.1", port: 4628, strictPort: true},
 build: {cssMinify: "lightningcss", manifest: true},
});
