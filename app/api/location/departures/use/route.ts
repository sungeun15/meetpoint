import { apiError, apiOk } from "@/lib/contracts/api";
import { touchDepartureLocationLastUsedAt } from "@/lib/repositories/departures";
import { createProtectedRoute } from "@/lib/utils/route-scaffold";
import { InputValidationError, validateUuid } from "@/lib/utils/validation";

export const dynamic = "force-dynamic";

// 최근 사용 갱신은 현재 사용자 소유 출발 위치에만 허용한다.
export const POST = createProtectedRoute(async (request, { currentUserId }) => {
    try {
        const body = await request.json();
        const departureLocationId = validateUuid(body.departureLocationId, "departureLocationId");
        const departure = await touchDepartureLocationLastUsedAt({
            userId: currentUserId,
            departureLocationId,
        });

        if (!departure) {
            return apiError("DEPARTURE_NOT_FOUND", "해당 저장 위치를 찾을 수 없습니다.", 404);
        }

        return apiOk({ departure });
    } catch (error) {
        if (error instanceof InputValidationError) {
            return apiError("INVALID_INPUT", error.message, 400);
        }

        if (error instanceof SyntaxError) {
            return apiError("INVALID_INPUT", "요청 본문 형식이 올바르지 않습니다.", 400);
        }

        return apiError("INTERNAL_ERROR", "저장 위치 사용 시각 갱신 중 오류가 발생했습니다.", 500);
    }
});