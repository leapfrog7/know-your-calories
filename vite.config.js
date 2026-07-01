import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/know-your-calories/",
  plugins: [react(), tailwindcss()],
});
