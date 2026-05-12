import { config } from "dotenv";
config({ path: ".env.local" });

import { sql } from "@vercel/postgres";

async function main() {
  const { rows } = await sql<{ table_name: string }>`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;
  console.log("Tables in Vercel Postgres:");
  rows.forEach((r) => console.log(`  - ${r.table_name}`));
  console.log(`Total: ${rows.length} tables`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
