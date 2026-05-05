import { spawnSync } from "node:child_process";
import process from "node:process";
import { loadEnvFile, requireEnv, resolveEnvPath } from "./lib/env-utils.mjs";

// psql 명령을 재사용해 정리 SQL도 같은 방식으로 실행한다.
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

    // 테스트로 만든 테이블을 제거해 다시 깨끗한 상태로 되돌린다.
    const cleanupSql = `
drop table if exists public.${tableName};
select to_regclass('public.${tableName}') as table_name;
`;

    const cleanupOutput = runPsql(databaseUrl, cleanupSql);

    console.log("Supabase test table cleanup completed.");
    console.log(`Table: public.${tableName}`);
    console.log(cleanupOutput);
}

run().catch((error) => {
    console.error("Supabase test table cleanup failed.");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});