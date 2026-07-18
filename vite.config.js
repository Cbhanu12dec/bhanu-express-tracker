import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// This must match your GitHub repo name exactly.
// Your site is https://cbhanu12dec.github.io/bhanu-express-tracker/
// so base needs to be "/bhanu-express-tracker/".
//
// The base path only applies to the production build (npm run build), so it
// doesn't break the local dev server (npm run dev), which always serves from "/".
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/bhanu-express-tracker/" : "/",
}));