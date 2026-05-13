import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import process from "node:process";

import { loadEnvFile, requireEnv, resolveEnvPath } from "./lib/env-utils.mjs";

function runPsqlFile(databaseUrl, sqlFilePath) {
    const result = spawnSync(
        "psql",
        [databaseUrl, "-v", "ON_ERROR_STOP=1", "-f", sqlFilePath],
        {
            encoding: "utf8",
        },
    );

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        throw new Error([result.stdout, result.stderr].filter(Boolean).join("\n").trim());
    }

    return result.stdout.trim();
}

function runPsql(databaseUrl, sql) {
    const result = spawnSync(
        "psql",
        [databaseUrl, "-v", "ON_ERROR_STOP=1", "-c", sql],
        {
            encoding: "utf8",
        },
    );

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        throw new Error([result.stdout, result.stderr].filter(Boolean).join("\n").trim());
    }

    return result.stdout.trim();
}

async function run() {
    const envPath = resolveEnvPath();
    loadEnvFile(envPath);

    const databaseUrl = requireEnv("SUPABASE_DATABASE_URL");
    const schemaFilePath = path.resolve(process.cwd(), "supabase", "meetpoint-mvp-schema.sql");

    if (!fs.existsSync(schemaFilePath)) {
        throw new Error(`Schema file not found at ${schemaFilePath}`);
    }

    const applyOutput = runPsqlFile(databaseUrl, schemaFilePath);
    const verifyOutput = runPsql(
        databaseUrl,
        `
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('users', 'friends', 'messages', 'departure_locations')
order by table_name;

select indexname
from pg_indexes
where schemaname = 'public'
  and tablename in ('users', 'friends', 'messages', 'departure_locations')
order by tablename, indexname;
`,
    );

    console.log("Supabase schema apply script completed.");
    console.log(`Schema file: ${schemaFilePath}`);
    console.log(applyOutput);
    console.log(verifyOutput);
}

run().catch((error) => {
    console.error("Supabase schema apply script failed.");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});