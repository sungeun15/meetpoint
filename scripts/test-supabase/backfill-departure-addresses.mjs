import process from "node:process";

import { createClient } from "@supabase/supabase-js";

import { loadEnvFile, requireEnv, resolveEnvPath } from "./lib/env-utils.mjs";

function getSupabaseAdminClient() {
    const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "");
    const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}

function getKakaoLocalRestApiKey() {
    return requireEnv("KAKAO_LOCAL_REST_API_KEY");
}

async function resolveAddressFromCoordinates(lat, lng) {
    const url = new URL("https://dapi.kakao.com/v2/local/geo/coord2address.json");

    url.searchParams.set("x", String(lng));
    url.searchParams.set("y", String(lat));

    const response = await fetch(url, {
        headers: {
            Authorization: `KakaoAK ${getKakaoLocalRestApiKey()}`,
        },
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(`Kakao coord2address failed: ${response.status} ${response.statusText}`);
    }

    const payload = await response.json();
    const firstDocument = Array.isArray(payload.documents) ? payload.documents[0] : null;

    return firstDocument?.road_address?.address_name
        ?? firstDocument?.address?.address_name
        ?? "";
}

async function listRowsMissingAddress(supabase) {
    const pageSize = 500;
    const rows = [];
    let from = 0;

    while (true) {
        const { data, error } = await supabase
            .from("departure_locations")
            .select("id, lat, lng, address")
            .order("created_at", { ascending: true })
            .range(from, from + pageSize - 1);

        if (error) {
            throw error;
        }

        if (!data?.length) {
            break;
        }

        rows.push(...data.filter((row) => typeof row.address !== "string" || !row.address.trim()));

        if (data.length < pageSize) {
            break;
        }

        from += pageSize;
    }

    return rows;
}

async function run() {
    const envPath = resolveEnvPath();
    loadEnvFile(envPath);

    const supabase = getSupabaseAdminClient();
    const rows = await listRowsMissingAddress(supabase);

    if (!rows.length) {
        console.log("No departure_locations rows require address backfill.");
        return;
    }

    let updatedCount = 0;
    let skippedCount = 0;

    for (const row of rows) {
        const address = await resolveAddressFromCoordinates(row.lat, row.lng);

        if (!address) {
            skippedCount += 1;
            continue;
        }

        const { error } = await supabase
            .from("departure_locations")
            .update({ address })
            .eq("id", row.id);

        if (error) {
            throw error;
        }

        updatedCount += 1;
    }

    console.log(`Departure address backfill completed. updated=${updatedCount} skipped=${skippedCount}`);
}

run().catch((error) => {
    console.error("Departure address backfill failed.");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});