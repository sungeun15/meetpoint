import { buildRecommendationRequirementMessage } from "../chat-recommendation-feedback";
import { resolveDepartureLocation } from "../chat-recommendation-departure-resolver";
import type { SelectedSavedDepartures } from "../chat-recommendation-flow-helpers";
import type {
    DepartureInputMethod,
    DepartureParty,
    MeetingMode,
    RecommendationCategory,
    RecommendationSnapshot,
    ResolvedLocation,
} from "../../types";
import { buildRecommendationSnapshotFromApi } from "./chat-recommendation-api-snapshot";
import { requestRecommendation } from "./chat-recommendation-request";

type RunRecommendationFlowArgs = {
    activeFriendId: string; // 추천을 계산할 친구 id 입니다.
    meetingMode: MeetingMode; // now/later 추천 모드입니다.
    friendName: string; // 요약과 카드 라벨에 사용할 친구 이름입니다.
    mySharedLocation: (ResolvedLocation & { sharedAt: string }) | null; // 현재 공유된 내 위치입니다.
    friendLocation: (ResolvedLocation & { sharedAt: string | null }) | null; // recommendation 모듈 공용 형태로 정규화한 친구 위치입니다.
    selectedCategory: RecommendationCategory; // 현재 선택한 추천 카테고리입니다.
    departureInputMethod: DepartureInputMethod; // later 모드에서 사용하는 출발지 입력 방식입니다.
    selectedDepartureLabels: Record<DepartureParty, string | null> | null; // 현재 화면 기준 출발지 라벨입니다.
    selectedSavedDepartures: SelectedSavedDepartures; // 저장 위치 선택 모드에서 사용할 실제 저장 출발지 객체입니다.
    pinnedDepartureLabels: Record<DepartureParty, string>; // 핀으로 확정한 주소 라벨입니다.
    pinnedDepartureLocations: Record<DepartureParty, ResolvedLocation | null>; // 핀으로 확정한 좌표입니다.
    departureSearchQueries: Record<DepartureParty, string>; // 검색 입력 원본입니다.
};

export type RunRecommendationFlowResult =
    | { status: "blocked"; message: string } // 추천 실행 전제 조건이 부족한 상태입니다.
    | { status: "unauthorized" } // 로그인 만료로 재인증이 필요한 상태입니다.
    | { status: "error"; message: string } // 실행 중 오류가 난 상태입니다.
    | { status: "ok"; snapshot: RecommendationSnapshot; placeCount: number }; // 최종 snapshot 과 추천 개수를 확보한 상태입니다.

export async function runRecommendationFlow({
    activeFriendId,
    meetingMode,
    friendName,
    mySharedLocation,
    friendLocation,
    selectedCategory,
    departureInputMethod,
    selectedDepartureLabels,
    selectedSavedDepartures,
    pinnedDepartureLabels,
    pinnedDepartureLocations,
    departureSearchQueries,
}: RunRecommendationFlowArgs): Promise<RunRecommendationFlowResult> {
    const recommendationRequirementMessage = buildRecommendationRequirementMessage({
        meetingMode,
        friendName,
        hasMyLocation: Boolean(mySharedLocation),
        hasFriendLocation: Boolean(friendLocation),
        hasMyDeparture: Boolean(selectedDepartureLabels?.me),
        hasFriendDeparture: Boolean(selectedDepartureLabels?.friend),
    });

    if (recommendationRequirementMessage) {
        return {
            status: "blocked",
            message: recommendationRequirementMessage,
        };
    }

    if (!activeFriendId) {
        return {
            status: "blocked",
            message: "추천할 친구를 먼저 선택해 주세요.",
        };
    }

    // now 모드는 현재 공유 위치를 그대로 사용하고, later 모드는 입력 방식에 맞춰 실제 출발지 좌표를 해석합니다.
    const [myOrigin, friendOrigin] = meetingMode === "now"
        ? [mySharedLocation, friendLocation] as const
        : await Promise.all([
            resolveDepartureLocation({
                party: "me",
                departureInputMethod,
                selectedSavedDepartures,
                pinnedDepartureLabels,
                pinnedDepartureLocations,
                departureSearchQueries,
                friendName,
            }),
            resolveDepartureLocation({
                party: "friend",
                departureInputMethod,
                selectedSavedDepartures,
                pinnedDepartureLabels,
                pinnedDepartureLocations,
                departureSearchQueries,
                friendName,
            }),
        ]);

    if (!myOrigin || !friendOrigin) {
        return {
            status: "error",
            message: "추천 계산에 필요한 좌표를 아직 준비하지 못했어요.",
        };
    }

    const recommendationResult = await requestRecommendation({
        activeFriendId,
        meetingMode,
        selectedCategory,
        departureInputMethod,
        selectedDepartureLabels,
        myOrigin,
        friendOrigin,
    });

    if (recommendationResult.status === "unauthorized") {
        return { status: "unauthorized" };
    }

    if (recommendationResult.status === "error") {
        return recommendationResult;
    }

    return {
        status: "ok",
        snapshot: await buildRecommendationSnapshotFromApi({
            response: recommendationResult.data,
            meetingMode,
            selectedCategory,
            friendName,
            myOrigin,
            friendOrigin,
            selectedDepartureLabels,
        }),
        placeCount: recommendationResult.data.places.length,
    };
}