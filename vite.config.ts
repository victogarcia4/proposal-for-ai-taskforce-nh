import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import netlify from "@netlify/vite-plugin-tanstack-start";
import { nitro } from "nitro/vite";
import { fileURLToPath, URL } from "node:url";
import { readQuestionBank } from "./scripts/consultation-content.mjs";
import { seedSql } from "./scripts/seed-sql.mjs";
import { readFileSync } from "node:fs";

export default defineConfig(({ command, mode }) => {
  const isVercel = mode === "vercel" || process.env.VERCEL === "1";
  return {
    // The Supabase project URL is public by design; expose it to the browser
    // bundle from the environment instead of hard-coding it in source.
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
        process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "",
      ),
    },
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  // Standard/Lovable previews must not require Netlify account configuration.
  // Always include the deployment adapter in builds; opt into local platform
  // emulation explicitly with `npm run dev:netlify`.
  plugins: [
    {
      name: "consultation-plan-content",
      resolveId: (id) =>
        id === "virtual:question-bank" ? "\0virtual:question-bank" : undefined,
      load: (id) =>
        id === "\0virtual:question-bank"
          ? `export default ${JSON.stringify(readQuestionBank())}`
          : undefined,
      configureServer(server) {
        server.middlewares.use("/database-setup", (req, res) => {
          const sql = req.url?.includes("harden")
            ? readFileSync(
                new URL(
                  "./supabase/migrations/20261002200553_consultation_access_and_indexes.sql",
                  import.meta.url,
                ),
                "utf8",
              )
            : req.url?.includes("review")
              ? readFileSync(
                  new URL(
                    "./supabase/migrations/20261002195734_consultation_reporting_and_review.sql",
                    import.meta.url,
                  ),
                  "utf8",
                )
              : readFileSync(
                  new URL(
                    "./database/consultation-schema.sql",
                    import.meta.url,
                  ),
                  "utf8",
                ) +
                "\n" +
                seedSql();
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(
            '<!doctype html><html lang="en"><title>Development database setup</title><h1>Tested consultation schema and seed</h1><pre>' +
              sql
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;") +
              "</pre></html>",
          );
        });
      },
    },
    tanstackStart(),
    ...(isVercel
      ? [nitro()]
      : command === "build" || mode === "netlify"
        ? [netlify()]
        : []),
    react(),
  ],
  };
});
