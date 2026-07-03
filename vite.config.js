import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/know-your-calories/",

  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",

      includeAssets: ["favicon.ico"],

      manifest: {
        name: "Know Your Calories",
        short_name: "Calories",
        description:
          "A mobile-first calorie and macro tracker for Indian foods, packaged foods, and daily meal logging.",
        theme_color: "#020617",
        background_color: "#f8fafc",
        display: "standalone",
        orientation: "portrait",
        scope: "/know-your-calories/",
        start_url: "/know-your-calories/",

        icons: [
          {
            src: "/know-your-calories/favicon.ico",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon",
          },
        ],
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],
      },
    }),
  ],
});