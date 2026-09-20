import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  plugins: [react()].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Production build optimization
  build: {
    target: "es2022",
    minify: "esbuild",
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React (always loaded)
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // TanStack Query (widely used)
          "vendor-query": ["@tanstack/react-query"],
          // Web3 Core - split into smaller chunks
          "vendor-viem": ["viem"],
          "vendor-wagmi": ["wagmi"],
          // Wallet connectors (large, load on demand)
          "vendor-wallet": [
            "@rainbow-me/rainbowkit",
            "@wagmi/connectors",
            "@walletconnect/utils",
            "@coinbase/wallet-sdk",
          ],
          // LiveKit (load when Ava is opened)
          "vendor-livekit": ["@livekit/components-react", "livekit-client"],
          // Radix UI (UI primitives)
          "vendor-radix": ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-tabs", "@radix-ui/react-tooltip", "@radix-ui/react-popover", "@radix-ui/react-select", "@radix-ui/react-accordion", "@radix-ui/react-alert-dialog", "@radix-ui/react-avatar", "@radix-ui/react-checkbox", "@radix-ui/react-collapsible", "@radix-ui/react-context-menu", "@radix-ui/react-hover-card", "@radix-ui/react-label", "@radix-ui/react-menubar", "@radix-ui/react-navigation-menu", "@radix-ui/react-progress", "@radix-ui/react-radio-group", "@radix-ui/react-scroll-area", "@radix-ui/react-separator", "@radix-ui/react-slider", "@radix-ui/react-slot", "@radix-ui/react-switch", "@radix-ui/react-toggle", "@radix-ui/react-toggle-group", "@radix-ui/react-aspect-ratio"],
          // UI Libraries
          "vendor-ui-core": ["lucide-react", "clsx", "tailwind-merge", "class-variance-authority"],
          "vendor-ui-forms": ["react-hook-form", "@hookform/resolvers", "zod", "input-otp", "react-day-picker", "date-fns"],
          "vendor-ui-charts": ["recharts", "embla-carousel-react", "vaul", "cmdk", "react-resizable-panels", "qrcode.react", "sonner"],
          // Themes
          "vendor-themes": ["next-themes"],
          // Ethers
          "vendor-ethers": ["ethers"],
        },
        // Optimize chunk naming for caching
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    // Increase chunk size warning limit to 500kb
    chunkSizeWarningLimit: 500,
    // Enable report for bundle analysis
    reportCompressedSize: true,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "wagmi",
      "viem",
      "@rainbow-me/rainbowkit",
      "@livekit/components-react",
      "livekit-client",
      "lucide-react",
      "@tanstack/react-query",
    ],
    exclude: ["@livekit/components-styles"],
  },
}));
