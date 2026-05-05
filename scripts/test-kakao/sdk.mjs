import process from "node:process";
import {
    requireProjectEnv,
    resolveEnvPath,
} from "./lib/env-utils.mjs";

function getReferer() {
    return process.env.KAKAO_MAP_TEST_REFERER || "http://localhost:3000/";
}

async function run() {
    const envPath = resolveEnvPath();

    const appKey = requireProjectEnv("NEXT_PUBLIC_KAKAO_MAP_APP_KEY", envPath);
    const referer = getReferer();
    const response = await fetch(
        `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`,
        {
            headers: {
                Referer: referer,
            },
        },
    );
    const body = await response.text();

    if (!response.ok) {
        throw new Error(
            `Kakao Map SDK request failed with ${response.status} ${response.statusText}: ${body}`,
        );
    }

    if (body.includes("AccessDeniedError") || body.includes("domain mismatched")) {
        throw new Error(
            `Kakao Map SDK request was rejected for referer ${referer}. Check Kakao Developers > JavaScript SDK domain registration. Response: ${body}`,
        );
    }

    if (!body.includes("window.kakao.maps") && !body.includes("window.daum.maps")) {
        throw new Error(
            `Kakao Map SDK response did not contain the expected loader code. Referer: ${referer}`,
        );
    }

    console.log("Kakao Map SDK check passed.");
    console.log(`Referer: ${referer}`);
    console.log(`App key prefix: ${appKey.slice(0, 8)}...`);
}

run().catch((error) => {
    console.error("Kakao Map SDK check failed.");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});