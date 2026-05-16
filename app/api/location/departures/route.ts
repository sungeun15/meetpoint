import { apiError, apiOk } from "@/lib/contracts/api";
import {
    createDepartureLocation,
    deleteDepartureLocations,
    listSavedDepartureLocations,
    updateDepartureLocation,
} from "@/lib/repositories/departures";
import { createProtectedRoute } from "@/lib/utils/route-scaffold";
import {
    InputValidationError,
    validateCoordinates,
    validateDepartureLabel,
    validateLimit,
    validateLocationKind,
    validateUuid,
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

// 저장된 출발 위치 수정은 id/좌표/라벨 검증 후 현재 사용자 소유 row 를 갱신한다.
export const PATCH = createProtectedRoute(async (request, { currentUserId }) => {
    try {
        const body = await request.json();
        const departureLocationId = validateUuid(body.departureLocationId, "departureLocationId");
        const label = validateDepartureLabel(body.label);
        const { lat, lng } = validateCoordinates(body.lat, body.lng);
        const departure = await updateDepartureLocation({
            userId: currentUserId,
            departureLocationId,
            label,
            lat,
            lng,
        });

        if (!departure) {
            return apiError("NOT_FOUND", "수정할 저장 위치를 찾지 못했습니다.", 404);
        }

        return apiOk({ departure });
    } catch (error) {
        if (error instanceof InputValidationError) {
            return apiError("INVALID_INPUT", error.message, 400);
        }

        if (error instanceof SyntaxError) {
            return apiError("INVALID_INPUT", "요청 본문 형식이 올바르지 않습니다.", 400);
        }

        return apiError("INTERNAL_ERROR", "저장 위치 수정 중 오류가 발생했습니다.", 500);
    }
});

// 저장된 출발 위치 삭제는 id 배열을 받아 개별/다건 삭제를 공통 처리한다.
export const DELETE = createProtectedRoute(async (request, { currentUserId }) => {
    try {
        const body = await request.json();

        if (!Array.isArray(body.departureLocationIds) || body.departureLocationIds.length === 0) {
            throw new InputValidationError("departureLocationIds는 한 개 이상 필요합니다.");
        }

        const departureLocationIds = body.departureLocationIds.map((value: unknown) => validateUuid(value, "departureLocationId"));
        const deletedIds = await deleteDepartureLocations({
            userId: currentUserId,
            departureLocationIds,
        });

        return apiOk({ deletedIds });
    } catch (error) {
        if (error instanceof InputValidationError) {
            return apiError("INVALID_INPUT", error.message, 400);
        }

        if (error instanceof SyntaxError) {
            return apiError("INVALID_INPUT", "요청 본문 형식이 올바르지 않습니다.", 400);
        }

        return apiError("INTERNAL_ERROR", "저장 위치 삭제 중 오류가 발생했습니다.", 500);
    }
});