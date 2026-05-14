import { apiError, apiOk } from "@/lib/contracts/api";
import { KakaoLocalApiError, searchPlacesByKeyword } from "@/lib/kakao/local";
import { createProtectedRoute } from "@/lib/utils/route-scaffold";
import { InputValidationError, validateLocationSearchQuery } from "@/lib/utils/validation";

export const dynamic = "force-dynamic";

// 출발 위치 검색은 서버에서 Kakao Local API 키워드 검색을 대신 호출한다.
export const GET = createProtectedRoute(async (request) => {
    try {
        const { searchParams } = new URL(request.url);
        const query = validateLocationSearchQuery(searchParams.get("query"));
        const places = await searchPlacesByKeyword(query);

        return apiOk({ places });
    } catch (error) {
        if (error instanceof InputValidationError) {
            return apiError("INVALID_INPUT", error.message, 400);
        }

        if (error instanceof KakaoLocalApiError) {
            return apiError("KAKAO_API_FAILED", error.message, 502);
        }

        return apiError("INTERNAL_ERROR", "출발 위치 검색 중 오류가 발생했습니다.", 500);
    }
});