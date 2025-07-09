import 'dotenv/config';
import { defineConfig } from "drizzle-kit";

let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  // Fallback de desarrollo igual que en server/db.ts
  databaseUrl = "postgres://postgres:postgres@localhost:5432/project_tracker_pro";
  console.warn("[WARN] DATABASE_URL no definida. Usando valor por defecto de desarrollo: " + databaseUrl);
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
