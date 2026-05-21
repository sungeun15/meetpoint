import type { ApiResponse } from "@/lib/contracts/api";

import type { DepartureParty } from "../../types";
import type {
    SavedDepartureCreateResponse,
    SavedDepartureDeleteResponse,
    SavedDepartureListResponse,
    SavedDepartureUpdateResponse,
    SavedDepartureUseResponse,
} from "./chat-recommendation-saved-departure-api";

type SavedDepartureLocationPayload = {
    address: string; // 저장 API 로 넘길 확정 주소입니다.
    latitude: number; // 저장 API 로 넘길 위도입니다.
    longitude: number; // 저장 API 로 넘길 경도입니다.
};

type SavedDepartureRequestResult<T> =
    | { status: "ok"; data: T }
    | { status: "unauthorized" }
    | { status: "error"; message: string };

type CreateSavedDepartureRequestArgs = {
    label: string; // 저장 출발지 제목입니다.
    ownerParty: DepartureParty; // 내 출발지인지 친구 출발지인지 나타냅니다.
    resolvedLocation: SavedDepartureLocationPayload; // 서버에 저장할 확정 주소/좌표입니다.
    friendId: string | null; // 친구 출발지 저장 시 연결할 친구 id 입니다.
    friendNickname: string | null; // 목록 표시용 친구 닉네임입니다.
    locationKind: "recent" | "preset"; // 최근값 저장인지 고정 preset 저장인지 구분합니다.
};

type UpdateSavedDepartureRequestArgs = {
    departureId: string; // 수정할 저장 출발지 id 입니다.
    label: string; // 수정 후 제목입니다.
    resolvedLocation: SavedDepartureLocationPayload; // 수정 후 주소/좌표입니다.
};

function buildSavedDepartureErrorMessage<T>(
    payload: ApiResponse<T>,
    fallbackMessage: string,
) {
    return payload.ok ? fallbackMessage : payload.error.message;
}

export async function fetchSavedDepartures(limit: number): Promise<SavedDepartureRequestResult<SavedDepartureListResponse>> {
    const response = await fetch(`/api/location/departures?limit=${limit}`, {
        method: "GET",
        cache: "no-store",
    });
    const payload = (await response.json()) as ApiResponse<SavedDepartureListResponse>;

    if (response.status === 401) {
        return { status: "unauthorized" };
    }

    if (!response.ok || !payload.ok) {
        return {
            status: "error",
            message: buildSavedDepartureErrorMessage(payload, "저장 위치 목록을 불러오지 못했습니다."),
        };
    }

    return {
        status: "ok",
        data: payload.data,
    };
}

export async function markSavedDepartureAsUsed(departureId: string): Promise<SavedDepartureRequestResult<SavedDepartureUseResponse>> {
    const response = await fetch("/api/location/departures/use", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            departureLocationId: departureId,
        }),
    });
    const payload = (await response.json()) as ApiResponse<SavedDepartureUseResponse>;

    if (response.status === 401) {
        return { status: "unauthorized" };
    }

    if (!response.ok || !payload.ok) {
        return {
            status: "error",
            message: buildSavedDepartureErrorMessage(payload, "저장 위치 사용 처리 중 오류가 발생했습니다."),
        };
    }

    return {
        status: "ok",
        data: payload.data,
    };
}

export async function deleteSavedDepartures(departureLocationIds: string[]): Promise<SavedDepartureRequestResult<SavedDepartureDeleteResponse>> {
    const response = await fetch("/api/location/departures", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            departureLocationIds,
        }),
    });
    const payload = (await response.json()) as ApiResponse<SavedDepartureDeleteResponse>;

    if (response.status === 401) {
        return { status: "unauthorized" };
    }

    if (!response.ok || !payload.ok) {
        return {
            status: "error",
            message: buildSavedDepartureErrorMessage(payload, "저장 위치 삭제 중 오류가 발생했습니다."),
        };
    }

    return {
        status: "ok",
        data: payload.data,
    };
}

export async function updateSavedDepartureRequest({
    departureId,
    label,
    resolvedLocation,
}: UpdateSavedDepartureRequestArgs): Promise<SavedDepartureRequestResult<SavedDepartureUpdateResponse>> {
    const response = await fetch("/api/location/departures", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            departureLocationId: departureId,
            label,
            address: resolvedLocation.address,
            lat: resolvedLocation.latitude,
            lng: resolvedLocation.longitude,
        }),
    });
    const payload = (await response.json()) as ApiResponse<SavedDepartureUpdateResponse>;

    if (response.status === 401) {
        return { status: "unauthorized" };
    }

    if (!response.ok || !payload.ok) {
        return {
            status: "error",
            message: buildSavedDepartureErrorMessage(payload, "저장 위치 수정 중 오류가 발생했습니다."),
        };
    }

    return {
        status: "ok",
        data: payload.data,
    };
}

export async function createSavedDepartureRequest({
    label,
    ownerParty,
    resolvedLocation,
    friendId,
    friendNickname,
    locationKind,
}: CreateSavedDepartureRequestArgs): Promise<SavedDepartureRequestResult<SavedDepartureCreateResponse>> {
    const response = await fetch("/api/location/departures", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            label,
            address: resolvedLocation.address,
            lat: resolvedLocation.latitude,
            lng: resolvedLocation.longitude,
            ownerParty,
            friendId,
            friendNickname,
            locationKind,
        }),
    });
    const payload = (await response.json()) as ApiResponse<SavedDepartureCreateResponse>;

    if (response.status === 401) {
        return { status: "unauthorized" };
    }

    if (!response.ok || !payload.ok) {
        return {
            status: "error",
            message: buildSavedDepartureErrorMessage(payload, "저장 위치 저장 중 오류가 발생했습니다."),
        };
    }

    return {
        status: "ok",
        data: payload.data,
    };
}