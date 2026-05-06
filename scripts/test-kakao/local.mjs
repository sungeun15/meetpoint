import process from "node:process";
import {
    requireProjectEnv,
    resolveEnvPath,
} from "./lib/env-utils.mjs";

// 별도 지정이 없으면 가장 단순한 키워드로 API 연결 여부만 빠르게 확인한다.
function getKeyword() {
    return process.env.KAKAO_LOCAL_TEST_QUERY || "카페";
}

async function run() {
    const envPath = resolveEnvPath();

    const restApiKey = requireProjectEnv("KAKAO_LOCAL_REST_API_KEY", envPath);
    const keyword = getKeyword();
    const url = new URL("https://dapi.kakao.com/v2/local/search/keyword.json");

    // 결과 한 건만 받아도 키와 기본 검색 동작이 정상인지 판단할 수 있다.
    url.searchParams.set("query", keyword);
    url.searchParams.set("size", "1");

    const response = await fetch(url, {
        headers: {
            Authorization: `KakaoAK ${restApiKey}`,
        },
    });
    const body = await response.text();

    if (!response.ok) {
        throw new Error(
            `Kakao Local API request failed with ${response.status} ${response.statusText}: ${body}`,
        );
    }

    // 실패 시 원문을 함께 보고 싶어 먼저 text로 읽고, 통과한 경우에만 JSON으로 파싱한다.
    const payload = JSON.parse(body);

    if (!Array.isArray(payload.documents)) {
        throw new Error("Kakao Local API response did not include a documents array.");
    }

    console.log("Kakao Local API check passed.");
    console.log(`Keyword: ${keyword}`);
    console.log(`Result count: ${payload.documents.length}`);

    if (payload.documents[0]) {
        console.log(`First place: ${payload.documents[0].place_name}`);
    }
}

run().catch((error) => {
    console.error("Kakao Local API check failed.");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});