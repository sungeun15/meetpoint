import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function parseEnvFile(filePath) {
    const content = fs.readFileSync(filePath, "utf8");

    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();

        if (!line || line.startsWith("#")) {
            continue;
        }

        const separatorIndex = line.indexOf("=");

        if (separatorIndex === -1) {
            continue;
        }

        const key = line.slice(0, separatorIndex).trim();
        let value = line.slice(separatorIndex + 1).trim();

        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        if (!(key in process.env)) {
            process.env[key] = value;
        }
    }
}

function requireEnv(name) {
    const value = process.env[name];

    if (!value) {
        throw new Error(`${name} is not set`);
    }

    return value;
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
        throw new Error(
            [result.stdout, result.stderr].filter(Boolean).join("\n").trim(),
        );
    }

    return result.stdout.trim();
}

async function run() {
    const envPath = path.resolve(process.cwd(), ".env");

    if (!fs.existsSync(envPath)) {
        throw new Error(`.env file not found at ${envPath}`);
    }

    parseEnvFile(envPath);

    const databaseUrl = requireEnv("SUPABASE_DATABASE_URL");
    const tableName = "_meetpoint_script_test";
    const createAndInsertSql = `
create table if not exists public.${tableName} (
    id bigserial primary key,
    note text not null,
    created_at timestamptz not null default now()
);

insert into public.${tableName} (note)
values ('created via scripts/test-supabase-table.mjs')
returning id, note, created_at;

select count(*) as row_count
from public.${tableName};
`;

    const verifySql = `
select to_regclass('public.${tableName}') as table_name;
`;

    const createOutput = runPsql(databaseUrl, createAndInsertSql);
    const verifyOutput = runPsql(databaseUrl, verifySql);

    console.log("Supabase test table script completed.");
    console.log(`Table: public.${tableName}`);
    console.log(createOutput);
    console.log(verifyOutput);
}

run().catch((error) => {
    console.error("Supabase test table script failed.");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});