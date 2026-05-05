import process from "node:process";
import { loadEnvFile, requireEnv, resolveEnvPath } from "./lib/env-utils.mjs";

// service role 키가 JWT 형식인지, 그리고 어떤 role을 담고 있는지 확인한다.
function decodeJwtPayload(token) {
    const parts = token.split(".");

    if (parts.length < 2) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is not a valid JWT format");
    }

    const payload = Buffer.from(parts[1], "base64url").toString("utf8");
    return JSON.parse(payload);
}

async function assertOkResponse(response, context) {
    if (!response.ok) {
        const errorBody = await response.text();

        throw new Error(
            `${context} failed with ${response.status} ${response.statusText}: ${errorBody}`,
        );
    }
}

// publishable key는 공개 엔드포인트에서 유효해야 한다.
async function verifyPublishableKey(supabaseUrl, publishableKey) {
    const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
        headers: {
            apikey: publishableKey,
        },
    });

    await assertOkResponse(response, "Publishable key validation");

    return response.json();
}

// service role 키는 관리자 권한이 필요한 REST 경로까지 통과해야 한다.
async function verifyServiceRoleKey(supabaseUrl, serviceRoleKey) {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
        },
    });

    await assertOkResponse(response, "Service role key validation");
}

async function run() {
    const envPath = resolveEnvPath();
    loadEnvFile(envPath);

    const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "");
    const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
    const publishableKey = requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
    const serviceRolePayload = decodeJwtPayload(serviceRoleKey);

    if (serviceRolePayload.role !== "service_role") {
        throw new Error(
            `SUPABASE_SERVICE_ROLE_KEY role must be service_role, got ${serviceRolePayload.role ?? "unknown"}`,
        );
    }

    const authSettings = await verifyPublishableKey(supabaseUrl, publishableKey);
    await verifyServiceRoleKey(supabaseUrl, serviceRoleKey);

    console.log("Supabase connection check passed.");
    console.log(`URL: ${supabaseUrl}`);
    console.log(`Publishable key prefix: ${publishableKey.slice(0, 18)}...`);
    console.log(`Publishable key auth endpoint: /auth/v1/settings (${authSettings.disable_signup === true ? "signup-disabled" : "signup-configured"})`);
    console.log(`Service role key role: ${serviceRolePayload.role}`);
}

run().catch((error) => {
    console.error("Supabase connection check failed.");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});