import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    base: mode === "development" ? "/" : "/",

    // Proxy configuration for development
    server: {
      proxy: {
        // Proxy API calls starting with /auth to the Express server
        "/auth": {
          // target: "http://localhost:3001", // Your Express server
          target: "https://auth-zb77.onrender.com", // Your Express server
          changeOrigin: true,
          secure: false, // If you're not using https in local development
        },
      },
    },
  };
});
