import { apiError, apiOk } from "@/lib/contracts/api";
import {
    createDepartureLocation,
    listSavedDepartureLocations,
} from "@/lib/repositories/departures";
import { createProtectedRoute } from "@/lib/utils/route-scaffold";
import {
    InputValidationError,
    validateCoordinates,
    validateDepartureLabel,
    validateLimit,
    validateLocationKind,
} from "@/lib/utils/validation";

export const dynamic = "force-dynamic";

// 저장된 출발 위치 목록은 현재 사용자 소유 데이터만 preset 우선 순서로 반환한다.
export const GET = createProtectedRoute(async (request, { currentUserId }) => {
    try {
        const { searchParams } = new URL(request.url);
        const limit = validateLimit(searchParams.get("limit"));
        const departures = await listSavedDepartureLocations(currentUserId, limit);

        return apiOk({ departures });
    } catch (error) {
        if (error instanceof InputValidationError) {
            return apiError("INVALID_INPUT", error.message, 400);
        }

        return apiError("INTERNAL_ERROR", "저장 위치 목록 조회 중 오류가 발생했습니다.", 500);
    }
});

// 저장된 출발 위치 추가는 label/좌표/locationKind 검증 후 현재 사용자 소유 row 를 생성한다.
export const POST = createProtectedRoute(async (request, { currentUserId }) => {
    try {
        const body = await request.json();
        const label = validateDepartureLabel(body.label);
        const { lat, lng } = validateCoordinates(body.lat, body.lng);
        const locationKind = validateLocationKind(body.locationKind);
        const departure = await createDepartureLocation({
            userId: currentUserId,
            label,
            lat,
            lng,
            locationKind,
        });

        return apiOk({ departure });
    } catch (error) {
        if (error instanceof InputValidationError) {
            return apiError("INVALID_INPUT", error.message, 400);
        }

        if (error instanceof SyntaxError) {
            return apiError("INVALID_INPUT", "요청 본문 형식이 올바르지 않습니다.", 400);
        }

        return apiError("INTERNAL_ERROR", "저장 위치 저장 중 오류가 발생했습니다.", 500);
    }
});