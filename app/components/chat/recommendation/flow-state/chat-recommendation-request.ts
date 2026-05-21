import type { ApiResponse } from "@/lib/contracts/api";

import type { DepartureInputMethod, DepartureParty, MeetingMode, RecommendationCategory, ResolvedLocation } from "../../types";
import type { RecommendationApiResponse } from "./chat-recommendation-api-snapshot";

type RequestRecommendationArgs = {
    activeFriendId: string; // 추천 대상 친구 id 입니다.
    meetingMode: MeetingMode; // now/later 추천 모드입니다.
    selectedCategory: RecommendationCategory; // 서버에 전달할 추천 카테고리입니다.
    departureInputMethod: DepartureInputMethod; // later 모드에서 사용한 출발지 입력 방식입니다.
    selectedDepartureLabels: Record<DepartureParty, string | null> | null; // 사용자가 화면에서 선택한 출발지 라벨입니다.
    myOrigin: ResolvedLocation; // 내 출발 좌표/주소 정보입니다.
    friendOrigin: ResolvedLocation; // 친구 출발 좌표/주소 정보입니다.
};

type RecommendationRequestBody =
    | {
        friendId: string; // 추천을 받을 친구 id 입니다.
        mode: MeetingMode; // 현재 위치 기준 추천 모드입니다.
        category: RecommendationCategory; // 요청 카테고리입니다.
    }
    | {
        friendId: string; // 추천을 받을 친구 id 입니다.
        mode: MeetingMode; // 출발지 기준 추천 모드입니다.
        category: RecommendationCategory; // 요청 카테고리입니다.
        departure: {
            label: string; // 내 출발지 이름 또는 주소입니다.
            source: DepartureInputMethod; // 내 출발지 입력 경로입니다.
            lat: number; // 내 출발지 위도입니다.
            lng: number; // 내 출발지 경도입니다.
        };
        friendDeparture: {
            label: string; // 친구 출발지 이름 또는 주소입니다.
            source: DepartureInputMethod; // 친구 출발지 입력 경로입니다.
            lat: number; // 친구 출발지 위도입니다.
            lng: number; // 친구 출발지 경도입니다.
        };
    };

export type RequestRecommendationResult =
    | { status: "ok"; data: RecommendationApiResponse } // 정상 응답과 추천 결과 payload 입니다.
    | { status: "unauthorized" } // 로그인 만료로 재인증이 필요한 상태입니다.
    | { status: "error"; message: string }; // 사용자에게 바로 보여줄 오류 메시지입니다.

function buildRecommendationRequestBody({
    activeFriendId,
    meetingMode,
    selectedCategory,
    departureInputMethod,
    selectedDepartureLabels,
    myOrigin,
    friendOrigin,
}: RequestRecommendationArgs): RecommendationRequestBody {
    // now 모드에서는 현재 공유 위치만으로 계산하므로 출발지 payload 를 보내지 않습니다.
    if (meetingMode === "now") {
        return {
            friendId: activeFriendId,
            mode: meetingMode,
            category: selectedCategory,
        };
    }

    // later 모드에서는 양쪽 출발지 좌표와 라벨을 모두 명시적으로 전달합니다.
    return {
        friendId: activeFriendId,
        mode: meetingMode,
        category: selectedCategory,
        departure: {
            label: selectedDepartureLabels?.me ?? myOrigin.address,
            source: departureInputMethod,
            lat: myOrigin.latitude,
            lng: myOrigin.longitude,
        },
        friendDeparture: {
            label: selectedDepartureLabels?.friend ?? friendOrigin.address,
            source: departureInputMethod,
            lat: friendOrigin.latitude,
            lng: friendOrigin.longitude,
        },
    };
}

export async function requestRecommendation(args: RequestRecommendationArgs): Promise<RequestRecommendationResult> {
    // fetch 결과를 상태 문자열로 정규화해 상위 훅이 분기만 담당하도록 만듭니다.
    const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(buildRecommendationRequestBody(args)),
    });
    const payload = (await response.json()) as ApiResponse<RecommendationApiResponse>;

    if (response.status === 401) {
        return { status: "unauthorized" };
    }

    if (!response.ok || !payload.ok) {
        return {
            status: "error",
            message: payload.ok ? "추천 결과를 불러오지 못했어요." : payload.error.message,
        };
    }

    return {
        status: "ok",
        data: payload.data,
    };
}