import { spawnSync } from "node:child_process";
import process from "node:process";
import { loadEnvFile, requireEnv, resolveEnvPath } from "./lib/env-utils.mjs";

// psql 실행 결과를 표준 출력 그대로 받아서 사람이 바로 확인할 수 있게 한다.
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
    const envPath = resolveEnvPath();
    loadEnvFile(envPath);

    const databaseUrl = requireEnv("SUPABASE_DATABASE_URL");
    const tableName = "_meetpoint_script_test";

    // 테이블이 없으면 만들고, 실행 흔적을 남길 테스트 데이터를 1건 적재한다.
    const createAndInsertSql = `
create table if not exists public.${tableName} (
    id bigserial primary key,
    note text not null,
    created_at timestamptz not null default now()
);

insert into public.${tableName} (note)
values ('created via scripts/test-supabase/table.mjs')
returning id, note, created_at;

select count(*) as row_count
from public.${tableName};
`;

    // 마지막으로 실제 테이블이 남아 있는지 Postgres 메타 함수로 다시 확인한다.
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