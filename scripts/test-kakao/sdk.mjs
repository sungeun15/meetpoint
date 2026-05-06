import process from "node:process";
import {
    requireProjectEnv,
    resolveEnvPath,
} from "./lib/env-utils.mjs";

// 기본 검증 대상은 로컬 개발 주소이고, 필요하면 환경 변수로 다른 도메인을 넣어 확인한다.
function getReferer() {
    return process.env.KAKAO_MAP_TEST_REFERER || "http://localhost:3000/";
}

async function run() {
    const envPath = resolveEnvPath();

    const appKey = requireProjectEnv("NEXT_PUBLIC_KAKAO_MAP_APP_KEY", envPath);
    const referer = getReferer();
    // 실제 브라우저와 비슷한 조건을 만들기 위해 Referer 헤더를 포함해 SDK 응답을 확인한다.
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

    // Kakao SDK 응답은 버전에 따라 전역 네임스페이스 표기가 조금 달라질 수 있어 두 패턴 모두 허용한다.
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