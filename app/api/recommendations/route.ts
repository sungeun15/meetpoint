import { apiError, apiOk } from "@/lib/contracts/api";
import { KakaoLocalApiError } from "@/lib/kakao/local";
import { hasFriendRelation } from "@/lib/repositories/friends";
import { findUserById } from "@/lib/repositories/users";
import {
    DepartureRequiredError,
    getRecommendations,
    LocationRequiredError,
} from "@/lib/services/recommendation-service";
import { createProtectedRoute } from "@/lib/utils/route-scaffold";
import {
    InputValidationError,
    validateDeparturePoint,
    validateRecommendationCategory,
    validateRecommendationMode,
    validateUuid,
} from "@/lib/utils/validation";

export const dynamic = "force-dynamic";

// 추천 결과는 currentUserId 기준 권한 검증 후 now/later 입력을 해석해 계산한다.
export const POST = createProtectedRoute(async (request, { currentUserId }) => {
    try {
        const body = await request.json();
        const friendId = validateUuid(body.friendId, "friendId");
        const mode = validateRecommendationMode(body.mode);
        const category = validateRecommendationCategory(body.category);
        const hasRelation = await hasFriendRelation(currentUserId, friendId);

        if (!hasRelation) {
            return apiError("FORBIDDEN_RELATION", "친구 관계가 없는 대상과는 추천을 조회할 수 없습니다.", 403);
        }

        const currentUser = await findUserById(currentUserId);
        const friendUser = await findUserById(friendId);

        if (!currentUser || !friendUser) {
            return apiError("INTERNAL_ERROR", "추천 대상 사용자 정보를 확인할 수 없습니다.", 500);
        }

        const recommendation = await getRecommendations({
            mode,
            category,
            currentUserLocation:
                currentUser.lat !== null && currentUser.lng !== null
                    ? { lat: currentUser.lat, lng: currentUser.lng }
                    : null,
            friendLocation:
                friendUser.lat !== null && friendUser.lng !== null
                    ? { lat: friendUser.lat, lng: friendUser.lng }
                    : null,
            departure: body.departure ? validateDeparturePoint(body.departure, "departure") : null,
            friendDeparture: body.friendDeparture
                ? validateDeparturePoint(body.friendDeparture, "friendDeparture")
                : null,
        });

        return apiOk(recommendation);
    } catch (error) {
        if (error instanceof InputValidationError) {
            return apiError("INVALID_INPUT", error.message, 400);
        }

        if (error instanceof LocationRequiredError) {
            return apiError("LOCATION_REQUIRED", error.message, 409);
        }

        if (error instanceof DepartureRequiredError) {
            return apiError("DEPARTURE_REQUIRED", error.message, 409);
        }

        if (error instanceof KakaoLocalApiError) {
            return apiError("KAKAO_API_FAILED", error.message, 502);
        }

        if (error instanceof SyntaxError) {
            return apiError("INVALID_INPUT", "요청 본문 형식이 올바르지 않습니다.", 400);
        }

        return apiError("INTERNAL_ERROR", "추천 결과 조회 중 오류가 발생했습니다.", 500);
    }
});