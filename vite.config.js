import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT: change "paycheck-tracker" below to your GitHub repo name.
// If your repo is https://github.com/you/paycheck-tracker, this is already correct.
// If your repo has a different name, update base to "/your-repo-name/".
export default defineConfig({
  plugins: [react()],
  base: "/",
});
