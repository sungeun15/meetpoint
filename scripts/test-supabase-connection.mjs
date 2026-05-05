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

function decodeJwtPayload(token) {
    const parts = token.split(".");

    if (parts.length < 2) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is not a valid JWT format");
    }

    const payload = Buffer.from(parts[1], "base64url").toString("utf8");
    return JSON.parse(payload);
}

async function run() {
    const envPath = path.resolve(process.cwd(), ".env");

    if (!fs.existsSync(envPath)) {
        throw new Error(`.env file not found at ${envPath}`);
    }

    parseEnvFile(envPath);

    const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "");
    const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
    const publishableKey = requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
    const serviceRolePayload = decodeJwtPayload(serviceRoleKey);

    if (serviceRolePayload.role !== "service_role") {
        throw new Error(
            `SUPABASE_SERVICE_ROLE_KEY role must be service_role, got ${serviceRolePayload.role ?? "unknown"}`,
        );
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
        },
    });

    if (!response.ok) {
        const errorBody = await response.text();

        throw new Error(
            `Supabase connection failed with ${response.status} ${response.statusText}: ${errorBody}`,
        );
    }

    console.log("Supabase connection check passed.");
    console.log(`URL: ${supabaseUrl}`);
    console.log(`Publishable key prefix: ${publishableKey.slice(0, 18)}...`);
    console.log(`Service role key role: ${serviceRolePayload.role}`);
}

run().catch((error) => {
    console.error("Supabase connection check failed.");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});