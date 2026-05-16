import { apiError, apiOk } from "@/lib/contracts/api";
import { findUserById, updateUserLocation } from "@/lib/repositories/users";
import { createProtectedRoute } from "@/lib/utils/route-scaffold";
import { InputValidationError, validateCoordinates } from "@/lib/utils/validation";

export const dynamic = "force-dynamic";

// 현재 사용자의 마지막 공유 위치를 조회해 새로고침 후 UI 복원에 사용한다.
export const GET = createProtectedRoute(async (_request, { currentUserId }) => {
    try {
        const user = await findUserById(currentUserId);

        return apiOk({
            location: user && user.lat !== null && user.lng !== null ? {
                lat: user.lat,
                lng: user.lng,
                locationUpdatedAt: user.locationUpdatedAt,
            } : null,
        });
    } catch {
        return apiError("INTERNAL_ERROR", "위치 조회 중 오류가 발생했습니다.", 500);
    }
});

// 현재 위치 저장은 인증된 사용자 자신의 마지막 공유 위치만 갱신한다.
export const POST = createProtectedRoute(async (request, { currentUserId }) => {
    try {
        const body = await request.json();
        const { lat, lng } = validateCoordinates(body.lat, body.lng);
        const user = await updateUserLocation({
            userId: currentUserId,
            lat,
            lng,
        });

        return apiOk({
            location: {
                lat: user.lat,
                lng: user.lng,
                locationUpdatedAt: user.locationUpdatedAt,
            },
        });
    } catch (error) {
        if (error instanceof InputValidationError) {
            return apiError("INVALID_INPUT", error.message, 400);
        }

        if (error instanceof SyntaxError) {
            return apiError("INVALID_INPUT", "요청 본문 형식이 올바르지 않습니다.", 400);
        }

        return apiError("INTERNAL_ERROR", "위치 저장 중 오류가 발생했습니다.", 500);
    }
});