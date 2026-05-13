import type { FriendItem } from "../../friends/types";
import {
    buildMapMarkers,
    buildRecommendationCards,
    buildRecommendationSummary,
} from "../data";
import {
    buildDepartureSummaryText,
    buildMidpointSummaryText,
    formatDepartureSummaryLabel,
    getMeetingModeLabel,
} from "./summary/chat-recommendation-summary";
import type {
    DepartureParty,
    MeetingMode,
    RecommendationCategory,
    RecommendationSnapshot,
    ResolvedLocation,
} from "../types";

type PreviewSummaryLocation = {
    address: string; // 요약 카드 미리보기에 필요한 최소 주소 정보입니다.
};

type MidpointPreview = {
    latitude: number; // 중심점 위도입니다.
    longitude: number; // 중심점 경도입니다.
};

type BuildPreviewRecommendationSummaryArgs = {
    meetingMode: MeetingMode; // 지금 만나기/나중에 만나기 중 어떤 추천 모드인지 나타냅니다.
    selectedCategory: RecommendationCategory; // 현재 선택된 추천 카테고리입니다.
    mySharedLocation: PreviewSummaryLocation | null; // 내 현재 공유 위치 요약 정보입니다.
    friendLocation: PreviewSummaryLocation | null; // 친구 현재 위치 요약 정보입니다.
    friendName: string; // 요약 문구에 삽입할 친구 이름입니다.
    currentMyDepartureSummaryLabel: string; // 현재 위치 모드에서 쓸 내 출발지 요약 라벨입니다.
    currentFriendDepartureSummaryLabel: string; // 현재 위치 모드에서 쓸 친구 출발지 요약 라벨입니다.
    selectedMeDepartureSummaryLabel: string; // 나중에 만나기 모드에서 쓸 내 선택 출발지 요약 라벨입니다.
    selectedFriendDepartureSummaryLabel: string; // 나중에 만나기 모드에서 쓸 친구 선택 출발지 요약 라벨입니다.
    liveMidpoint: MidpointPreview | null; // 현재 계산 가능한 중심점 미리보기입니다.
};

// 실제 추천 결과가 없어도 현재 입력 상태를 요약 카드로 미리 보여 주는 데이터를 만듭니다.
export function buildPreviewRecommendationSummary({
    meetingMode,
    selectedCategory,
    mySharedLocation,
    friendLocation,
    friendName,
    currentMyDepartureSummaryLabel,
    currentFriendDepartureSummaryLabel,
    selectedMeDepartureSummaryLabel,
    selectedFriendDepartureSummaryLabel,
    liveMidpoint,
}: BuildPreviewRecommendationSummaryArgs) {
    return buildRecommendationSummary({
        modeLabel: getMeetingModeLabel(meetingMode),
        category: selectedCategory,
        // 지금 만나기와 나중에 만나기는 출발 기준 문구가 달라서 여기서 분기해 요약 문구를 만듭니다.
        departureLabel: meetingMode === "now"
            ? mySharedLocation && friendLocation
                ? buildDepartureSummaryText("현재 공유 위치 기준", currentMyDepartureSummaryLabel, friendName, currentFriendDepartureSummaryLabel)
                : "현재 공유 위치 기준 · 내 위치를 공유하면 중심점을 계산할 수 있어요."
            : buildDepartureSummaryText("출발 위치 기준", selectedMeDepartureSummaryLabel, friendName, selectedFriendDepartureSummaryLabel),
        midpointLabel: liveMidpoint
            ? buildMidpointSummaryText(liveMidpoint.latitude, liveMidpoint.longitude)
            : `${friendName} 님과 내 위치가 모두 있어야 중심점을 계산할 수 있어요.`,
    });
}

type BuildRecommendationSnapshotArgs = {
    selectedFriend: FriendItem | null; // 카드 id와 친구 이름 보정에 사용할 친구 정보입니다.
    selectedCategory: RecommendationCategory; // 이번 추천에 적용할 카테고리입니다.
    myOrigin: ResolvedLocation; // 최종 추천 계산에 사용할 내 출발 좌표입니다.
    friendOrigin: ResolvedLocation; // 최종 추천 계산에 사용할 친구 출발 좌표입니다.
    midpoint: MidpointPreview; // 두 출발 좌표로부터 계산한 중심점입니다.
    friendName: string; // 요약 라벨과 마커 이름에 사용할 친구 이름입니다.
    meetingMode: MeetingMode; // 현재 위치 기준인지 출발 위치 기준인지 나타냅니다.
    selectedDepartureLabels: Record<DepartureParty, string | null> | null; // 나중에 만나기에서 사용자가 선택한 출발지 라벨입니다.
};

// 추천 카드, 요약, 지도 마커를 한 번에 묶은 최종 snapshot을 생성합니다.
export function buildRecommendationSnapshot({
    selectedFriend,
    selectedCategory,
    myOrigin,
    friendOrigin,
    midpoint,
    friendName,
    meetingMode,
    selectedDepartureLabels,
}: BuildRecommendationSnapshotArgs): RecommendationSnapshot {
    const cards = buildRecommendationCards({
        friend: selectedFriend,
        category: selectedCategory,
        myOrigin,
        friendOrigin,
        midpoint,
    });

    // snapshot 요약은 최종 출발 좌표와 사용자가 인지한 출발지 라벨을 함께 반영합니다.
    const summary = buildRecommendationSummary({
        modeLabel: getMeetingModeLabel(meetingMode),
        category: selectedCategory,
        departureLabel: meetingMode === "now"
            ? buildDepartureSummaryText(
                "현재 공유 위치 기준",
                formatDepartureSummaryLabel(myOrigin.address, "현재 위치"),
                friendName,
                formatDepartureSummaryLabel(friendOrigin.address, `${friendName} 위치`),
            )
            : buildDepartureSummaryText(
                "출발 위치 기준",
                formatDepartureSummaryLabel(selectedDepartureLabels?.me ?? myOrigin.address, "선택 필요"),
                friendName,
                formatDepartureSummaryLabel(selectedDepartureLabels?.friend ?? friendOrigin.address, `${friendName} 위치`),
            ),
        midpointLabel: buildMidpointSummaryText(midpoint.latitude, midpoint.longitude),
    });

    // 나중에 만나기에서도 지도 마커는 동일 구조를 쓰되 sharedAt은 없는 정적 출발지로 다룹니다.
    const markers = buildMapMarkers({
        friendName,
        myLocation: meetingMode === "now" ? myOrigin : { ...myOrigin, sharedAt: null },
        friendLocation: meetingMode === "now" ? friendOrigin : { ...friendOrigin, sharedAt: null },
        midpoint,
        recommendationCards: cards,
    });

    return {
        summary,
        cards,
        markers,
    };
}