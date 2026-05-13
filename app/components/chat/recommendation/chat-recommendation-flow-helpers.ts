import type { FriendItem } from "../../friends/types";
import {
    calculateMidpoint,
} from "../data";
import { resolveDepartureLocation } from "./chat-recommendation-departure-resolver";
import { buildRecommendationSnapshot } from "./chat-recommendation-snapshot-builder";
import type {
    DepartureInputMethod,
    DepartureParty,
    MeetingMode,
    RecommendationCategory,
    ResolvedLocation,
    SavedDeparture,
} from "../types";

export { buildSavedDeparture } from "./chat-recommendation-departure-resolver";
export { buildPreviewRecommendationSummary } from "./chat-recommendation-snapshot-builder";

// 저장 위치 입력 UI에서 바로 보여 줄 기본 preset 목록입니다.
export const initialSavedDepartures: SavedDeparture[] = [
    {
        id: "home",
        label: "우리집",
        address: "서울 광진구 아차산로 272",
        description: "최근 사용 · 건대입구역 도보 8분",
        locationKind: "recent",
    },
    {
        id: "office",
        label: "사무실",
        address: "서울 강남구 테헤란로 231",
        description: "프리셋 · 선릉역 4번 출구",
        locationKind: "preset",
    },
    {
        id: "campus",
        label: "학교 정문",
        address: "서울 성동구 왕십리로 222 한양대학교 서울캠퍼스",
        description: "프리셋 · 왕십리역 환승 기준",
        locationKind: "preset",
    },
];

// 출발 위치 입력 UI에서 항상 같은 순서로 양쪽 참여자를 순회하기 위한 기준입니다.
export const departurePartyOrder: DepartureParty[] = ["me", "friend"];

type SelectedSavedDepartureIds = Record<DepartureParty, string>; // 참여자별로 현재 선택된 저장 위치 id를 보관합니다.
type DepartureLabels = Record<DepartureParty, string>; // 참여자별로 화면에 표시할 출발 위치 라벨을 보관합니다.
type SelectedSavedDepartures = Record<DepartureParty, SavedDeparture | null>; // 참여자별로 실제 저장 위치 객체를 연결한 결과입니다.

// 선택된 저장 위치 id를 실제 SavedDeparture 객체로 치환합니다.
export function buildSelectedSavedDepartures(
    savedDepartures: SavedDeparture[],
    selectedSavedDepartureIds: SelectedSavedDepartureIds,
) {
    return departurePartyOrder.reduce<SelectedSavedDepartures>((accumulator, party) => {
        accumulator[party] = savedDepartures.find((departure) => departure.id === selectedSavedDepartureIds[party]) ?? null;
        return accumulator;
    }, { me: null, friend: null });
}

type BuildSelectedDepartureLabelsArgs = {
    meetingMode: MeetingMode; // 지금 만나기/나중에 만나기 중 어떤 모드인지 나타냅니다.
    departureInputMethod: DepartureInputMethod; // 검색/핀/저장 위치 중 어떤 입력 방식을 쓰는지 나타냅니다.
    departureSearchQueries: DepartureLabels; // 주소 검색 입력값 원본입니다.
    pinnedDepartureLabels: DepartureLabels; // 지도 핀으로 확정한 출발 위치 라벨입니다.
    previewSelectedSavedDepartures: Record<DepartureParty, SavedDeparture | null>; // 저장 위치 선택 상태를 미리보기용으로 풀어낸 객체입니다.
};

// 현재 추천 설정을 바탕으로 참여자별 출발 위치 라벨을 결정합니다.
export function buildSelectedDepartureLabels({
    meetingMode,
    departureInputMethod,
    departureSearchQueries,
    pinnedDepartureLabels,
    previewSelectedSavedDepartures,
}: BuildSelectedDepartureLabelsArgs) {
    if (meetingMode !== "later") {
        return null;
    }

    return departurePartyOrder.reduce<Record<DepartureParty, string | null>>((accumulator, party) => {
        if (departureInputMethod === "search") {
            const selectedAddress = departureSearchQueries[party].trim();
            accumulator[party] = selectedAddress || null;
            return accumulator;
        }

        if (departureInputMethod === "pin") {
            accumulator[party] = pinnedDepartureLabels[party] || null;
            return accumulator;
        }

        accumulator[party] = previewSelectedSavedDepartures[party]?.label ?? null;
        return accumulator;
    }, { me: null, friend: null });
}

type BuildRecommendationResultArgs = {
    meetingMode: MeetingMode; // 추천 기준이 현재 위치인지 약속 출발 위치인지 나타냅니다.
    mySharedLocation: (ResolvedLocation & { sharedAt: string }) | null; // 내 현재 공유 위치입니다.
    friendLocation: (ResolvedLocation & { sharedAt: string | null }) | null; // 친구 현재 공유 위치입니다.
    selectedFriend: FriendItem | null; // 카드/마커 라벨 생성에 쓰이는 선택된 친구 정보입니다.
    selectedCategory: RecommendationCategory; // 이번 추천에 적용할 장소 카테고리입니다.
    friendName: string; // 주소 해석 및 라벨 생성에 사용하는 친구 이름입니다.
    selectedDepartureLabels: Record<DepartureParty, string | null> | null; // 최종 선택된 출발 위치 라벨 요약입니다.
    departureInputMethod: DepartureInputMethod; // 출발 위치 입력 방식입니다.
    selectedSavedDepartures: SelectedSavedDepartures; // 저장 위치에서 선택된 실제 출발 위치 객체입니다.
    pinnedDepartureLabels: DepartureLabels; // 지도 핀으로 지정된 출발 위치 라벨입니다.
    departureSearchQueries: DepartureLabels; // 검색 입력 상태 그대로의 주소 문자열입니다.
};

// 추천 계산에 필요한 출발 좌표를 확보한 뒤 snapshot 빌더에 넘길 최종 입력을 조합합니다.
export async function buildRecommendationResult({
    meetingMode,
    mySharedLocation,
    friendLocation,
    selectedFriend,
    selectedCategory,
    friendName,
    selectedDepartureLabels,
    departureInputMethod,
    selectedSavedDepartures,
    pinnedDepartureLabels,
    departureSearchQueries,
}: BuildRecommendationResultArgs) {
    // 지금 만나기에서는 이미 공유된 좌표를 그대로 쓰고, 나중에 만나기에서는 입력값을 주소 해석합니다.
    const [myOrigin, friendOrigin] = meetingMode === "now"
        ? [mySharedLocation, friendLocation] as const
        : await Promise.all([
            resolveDepartureLocation({
                party: "me",
                departureInputMethod,
                selectedSavedDepartures,
                pinnedDepartureLabels,
                departureSearchQueries,
                friendName,
            }),
            resolveDepartureLocation({
                party: "friend",
                departureInputMethod,
                selectedSavedDepartures,
                pinnedDepartureLabels,
                departureSearchQueries,
                friendName,
            }),
        ]);

    if (!myOrigin || !friendOrigin) {
        throw new Error("추천 계산에 필요한 좌표를 아직 준비하지 못했어요.");
    }

    // 추천 점수 계산은 항상 두 사람 좌표의 중간점을 기준으로 진행합니다.
    const midpoint = calculateMidpoint([
        { latitude: myOrigin.latitude, longitude: myOrigin.longitude },
        { latitude: friendOrigin.latitude, longitude: friendOrigin.longitude },
    ]);

    if (!midpoint) {
        throw new Error("중심점을 계산하지 못했어요.");
    }

    return buildRecommendationSnapshot({
        selectedFriend,
        selectedCategory,
        myOrigin,
        friendOrigin,
        midpoint,
        friendName,
        meetingMode,
        selectedDepartureLabels,
    });
}