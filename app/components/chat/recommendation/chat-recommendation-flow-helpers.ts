import type { FriendItem } from "../../friends/types";
import type {
    ChatDepartureSettingsPanelActions,
    ChatDepartureSettingsPanelViewState,
} from "../departure/chat-departure-settings-panel";
import type { ChatRecommendationMapPanelProps } from "./map/chat-recommendation-map-panel";
import type { ChatRecommendationResultsPanelProps } from "./results/chat-recommendation-results-panel";
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
        description: "2026.05.26 오후 9.29",
        lastUsedAt: "2026-05-26T21:29:00+09:00",
        ownerParty: "me",
        friendId: null,
        friendNickname: null,
        locationKind: "recent",
        latitude: 37.54011,
        longitude: 127.07042,
    },
    {
        id: "office",
        label: "사무실",
        address: "서울 강남구 테헤란로 231",
        description: "2026.05.24 오전 8.15",
        lastUsedAt: "2026-05-24T08:15:00+09:00",
        ownerParty: "me",
        friendId: null,
        friendNickname: null,
        locationKind: "preset",
        latitude: 37.50329,
        longitude: 127.04394,
    },
    {
        id: "campus",
        label: "학교 정문",
        address: "서울 성동구 왕십리로 222 한양대학교 서울캠퍼스",
        description: "2026.05.21 오후 6.42",
        lastUsedAt: "2026-05-21T18:42:00+09:00",
        ownerParty: "me",
        friendId: null,
        friendNickname: null,
        locationKind: "preset",
        latitude: 37.55731,
        longitude: 127.04543,
    },
];

// 출발 위치 입력 UI에서 항상 같은 순서로 양쪽 참여자를 순회하기 위한 기준입니다.
export const departurePartyOrder: DepartureParty[] = ["me", "friend"];

// selection: 선택 id, 라벨, 미리보기 출발지 계산에 필요한 타입과 helper를 둡니다.
export type SelectedSavedDepartureIds = Record<DepartureParty, string>; // 참여자별로 현재 선택된 저장 위치 id를 보관합니다.
export type SelectedSavedDepartures = Record<DepartureParty, SavedDeparture | null>; // 참여자별로 실제 저장 위치 객체를 연결한 결과입니다.
export type SelectedDepartureLabels = Record<DepartureParty, string | null> | null; // 참여자별 최종 선택 출발지 라벨 요약입니다.

export type BuildSelectedSavedDeparturesArgs = {
    savedDepartures: SavedDeparture[];
    selectedSavedDepartureIds: SelectedSavedDepartureIds;
};

export type BuildSelectedSavedDeparturesResult = SelectedSavedDepartures;

// 선택된 저장 위치 id를 실제 SavedDeparture 객체로 치환합니다.
export function buildSelectedSavedDepartures(
    {
        savedDepartures,
        selectedSavedDepartureIds,
    }: BuildSelectedSavedDeparturesArgs,
): BuildSelectedSavedDeparturesResult {
    return departurePartyOrder.reduce<SelectedSavedDepartures>((accumulator, party) => {
        accumulator[party] = savedDepartures.find((departure) => departure.id === selectedSavedDepartureIds[party]) ?? null;
        return accumulator;
    }, { me: null, friend: null });
}

export type DepartureLabels = Record<DepartureParty, string>; // 참여자별로 화면에 표시할 출발 위치 라벨을 보관합니다.

export type BuildSelectedDepartureLabelsArgs = {
    meetingMode: MeetingMode; // 지금 만나기/나중에 만나기 중 어떤 모드인지 나타냅니다.
    departureInputMethod: DepartureInputMethod; // 검색/핀/저장 위치 중 어떤 입력 방식을 쓰는지 나타냅니다.
    departureSearchQueries: DepartureLabels; // 주소 검색 입력값 원본입니다.
    pinnedDepartureLabels: DepartureLabels; // 지도 핀으로 확정한 출발 위치 라벨입니다.
    previewSelectedSavedDepartures: Record<DepartureParty, SavedDeparture | null>; // 저장 위치 선택 상태를 미리보기용으로 풀어낸 객체입니다.
};

export type BuildSelectedDepartureLabelsResult = SelectedDepartureLabels;

// 현재 추천 설정을 바탕으로 참여자별 출발 위치 라벨을 결정합니다.
export function buildSelectedDepartureLabels({
    meetingMode,
    departureInputMethod,
    departureSearchQueries,
    pinnedDepartureLabels,
    previewSelectedSavedDepartures,
}: BuildSelectedDepartureLabelsArgs): BuildSelectedDepartureLabelsResult {
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

// panel props: 추천 패널 호출부를 납작하게 유지하기 위한 props 빌더 타입 묶음입니다.
// departure settings: panel props -> section panel props -> section props -> composition props 순서로 둡니다.
export type BuildChatDepartureSettingsPanelViewStateArgs = {
    meetingMode: MeetingMode;
    selectedCategory: RecommendationCategory;
    departureInputMethod: DepartureInputMethod;
    departureSearchQueries: Record<DepartureParty, string>;
    visibleSavedDepartures: Record<DepartureParty, SavedDeparture[]>;
    selectedSavedDepartureIds: Record<DepartureParty, string>;
    selectedDepartureFriendId: string;
    departureFriendOptions: Array<{ id: string; nickname: string }>;
    selectedFriendId: string;
    selectedDepartureLabels: SelectedDepartureLabels;
    selectedFriendName: string;
    canRecommend: boolean;
};

export type BuildChatDepartureSettingsPanelActionsArgs = {
    onShowToast: (message: string) => void;
    onMeetingModeChange: (nextMode: MeetingMode) => void;
    onCategoryChange: (nextCategory: RecommendationCategory) => void;
    onDepartureInputMethodChange: (nextMethod: DepartureInputMethod) => void;
    onDepartureSearchQueryChange: (party: DepartureParty, nextQuery: string) => void;
    onDepartureFriendChange: (nextFriendId: string) => void;
    onOpenSaveLocationLayer: (party: DepartureParty, previewValue: string, sourceLabel: string, resolvedLocation?: ResolvedLocation, locationKind?: "recent" | "preset", targetFriendId?: string, targetFriendName?: string) => void;
    onPinnedDepartureSelect: (party: DepartureParty, pinnedLocation: ResolvedLocation) => void;
    onSavedDepartureSelect: (party: DepartureParty, departureId: string) => Promise<boolean>;
    onDeleteSavedDeparture: (party: DepartureParty, departureId: string) => Promise<boolean>;
    onDeleteAllSavedDepartures: (party: DepartureParty) => Promise<boolean>;
    onUpdateSavedDeparture: (party: DepartureParty, departureId: string, title: string, resolvedLocation: ResolvedLocation) => Promise<boolean>;
    onRecommend: () => void;
};

export type BuildChatDepartureSettingsPanelViewStateResult = ChatDepartureSettingsPanelViewState;

export type BuildChatDepartureSettingsPanelActionsResult = ChatDepartureSettingsPanelActions;

export type RecommendationDepartureSettingsSectionPanelProps = {
    panelKey: string;
    viewState: ChatDepartureSettingsPanelViewState;
    actions: ChatDepartureSettingsPanelActions;
};

export type RecommendationDepartureSettingsSectionProps = RecommendationDepartureSettingsSectionPanelProps;

// results: panel props -> section panel props -> section props -> composition props 순서로 둡니다.
export type BuildChatRecommendationResultsPanelPropsArgs = ChatRecommendationResultsPanelProps;

export type BuildChatRecommendationResultsPanelPropsResult = ChatRecommendationResultsPanelProps;

export type RecommendationResultsSectionPanelProps = BuildChatRecommendationResultsPanelPropsResult;

export type RecommendationResultsSectionProps = RecommendationResultsSectionPanelProps;

// map: panel props -> section panel props -> section props -> composition props 순서로 둡니다.
export type BuildChatRecommendationMapPanelPropsArgs = ChatRecommendationMapPanelProps;

export type BuildChatRecommendationMapPanelPropsResult = ChatRecommendationMapPanelProps;

export type RecommendationMapSectionPanelProps = BuildChatRecommendationMapPanelPropsResult;

export type RecommendationMapSectionProps = RecommendationMapSectionPanelProps;

// composition: 상위 panels와 composition hook이 섹션별 조합을 다룰 때 사용하는 묶음 타입입니다.
export type ChatRecommendationPanelsDepartureSectionProps = BuildChatDepartureSettingsPanelViewStateArgs
    & BuildChatDepartureSettingsPanelActionsArgs;

export type ChatRecommendationPanelsDepartureCompositionProps = ChatRecommendationPanelsDepartureSectionProps;

export type ChatRecommendationPanelsSharedRecommendationProps = Pick<
    BuildChatRecommendationResultsPanelPropsArgs,
    "recommendationSummary" | "hasRecommendations"
>;

export type ChatRecommendationPanelsResultsSectionProps = Pick<
    BuildChatRecommendationResultsPanelPropsArgs,
    "meetingMode" | "recommendationCards"
>;

export type ChatRecommendationPanelsMapSectionProps = Pick<
    BuildChatRecommendationMapPanelPropsArgs,
    "mapMarkers"
>;

export type ChatRecommendationPanelsResultsCompositionProps = ChatRecommendationPanelsSharedRecommendationProps
    & ChatRecommendationPanelsResultsSectionProps;

export type ChatRecommendationPanelsMapCompositionProps = ChatRecommendationPanelsSharedRecommendationProps
    & ChatRecommendationPanelsMapSectionProps;

export type BuildChatRecommendationPanelsGroupedArgsResult = {
    departureCompositionArgs: ChatRecommendationPanelsDepartureCompositionProps;
    resultsCompositionArgs: ChatRecommendationPanelsResultsCompositionProps;
    mapCompositionArgs: ChatRecommendationPanelsMapCompositionProps;
};

export type ChatRecommendationPanelsCompositionSections = {
    departureSettingsSectionProps: RecommendationDepartureSettingsSectionProps;
    recommendationResultsSectionProps: RecommendationResultsSectionProps;
    recommendationMapSectionProps: RecommendationMapSectionProps;
};

export type RecommendationPanelsGridProps = ChatRecommendationPanelsCompositionSections;

export type BuildRecommendationDepartureSettingsSectionPropsArgs = RecommendationDepartureSettingsSectionProps;

export type BuildChatRecommendationPanelsCompositionResultArgs = ChatRecommendationPanelsCompositionSections;

export type ChatRecommendationPanelsProps = ChatRecommendationPanelsDepartureCompositionProps
    & ChatRecommendationPanelsResultsCompositionProps
    & ChatRecommendationPanelsMapCompositionProps;

export type BuildChatRecommendationPanelsGroupedArgsArgs = ChatRecommendationPanelsProps;

// departure settings panel builder: 설정 패널 입력값과 액션을 각각 조립합니다.
export function buildChatDepartureSettingsPanelViewState({
    meetingMode,
    selectedCategory,
    departureInputMethod,
    departureSearchQueries,
    visibleSavedDepartures,
    selectedSavedDepartureIds,
    selectedDepartureFriendId,
    departureFriendOptions,
    selectedFriendId,
    selectedDepartureLabels,
    selectedFriendName,
    canRecommend,
}: BuildChatDepartureSettingsPanelViewStateArgs): BuildChatDepartureSettingsPanelViewStateResult {
    return {
        meetingMode,
        selectedCategory,
        departureInputMethod,
        departureSearchQueries,
        visibleSavedDepartures,
        selectedSavedDepartureIds,
        selectedDepartureFriendId,
        departureFriendOptions,
        selectedFriendId,
        selectedDepartureLabels,
        selectedFriendName,
        canRecommend,
    };
}

export function buildChatDepartureSettingsPanelActions({
    onShowToast,
    onMeetingModeChange,
    onCategoryChange,
    onDepartureInputMethodChange,
    onDepartureSearchQueryChange,
    onDepartureFriendChange,
    onOpenSaveLocationLayer,
    onPinnedDepartureSelect,
    onSavedDepartureSelect,
    onDeleteSavedDeparture,
    onDeleteAllSavedDepartures,
    onUpdateSavedDeparture,
    onRecommend,
}: BuildChatDepartureSettingsPanelActionsArgs): BuildChatDepartureSettingsPanelActionsResult {
    return {
        onShowToast,
        onMeetingModeChange,
        onCategoryChange,
        onDepartureInputMethodChange,
        onDepartureSearchQueryChange,
        onDepartureFriendChange,
        onOpenSaveLocationLayer,
        onPinnedDepartureSelect,
        onSavedDepartureSelect,
        onDeleteSavedDeparture,
        onDeleteAllSavedDepartures,
        onUpdateSavedDeparture,
        onRecommend,
    };
}

// results panel builder: 선택 상태가 반영된 결과 패널 props를 조립합니다.
export function buildChatRecommendationResultsPanelProps({
    meetingMode,
    recommendationSummary,
    hasRecommendations,
    recommendationCards,
    selectedRecommendationId,
    onRecommendationCardSelect,
}: BuildChatRecommendationResultsPanelPropsArgs): BuildChatRecommendationResultsPanelPropsResult {
    return {
        meetingMode,
        recommendationSummary,
        hasRecommendations,
        recommendationCards,
        selectedRecommendationId,
        onRecommendationCardSelect,
    };
}

// map panel builder: 활성/포커스 마커를 포함한 지도 패널 props를 조립합니다.
export function buildChatRecommendationMapPanelProps({
    recommendationSummary,
    hasRecommendations,
    mapMarkers,
    activeMarkerId,
    focusedMarkerId,
    onMarkerSelect,
    onPlaceChipSelect,
}: BuildChatRecommendationMapPanelPropsArgs): BuildChatRecommendationMapPanelPropsResult {
    return {
        recommendationSummary,
        hasRecommendations,
        mapMarkers,
        activeMarkerId,
        focusedMarkerId,
        onMarkerSelect,
        onPlaceChipSelect,
    };
}

// departure settings section builder: 패널 key와 조립된 view/actions를 섹션 props로 묶습니다.
export function buildRecommendationDepartureSettingsSectionProps({
    panelKey,
    viewState,
    actions,
}: BuildRecommendationDepartureSettingsSectionPropsArgs): RecommendationDepartureSettingsSectionProps {
    return {
        panelKey,
        viewState,
        actions,
    };
}

// composition result builder: 각 섹션 props를 최종 grid/composition 반환 shape로 조립합니다.
export function buildChatRecommendationPanelsCompositionResult({
    departureSettingsSectionProps,
    recommendationResultsSectionProps,
    recommendationMapSectionProps,
}: BuildChatRecommendationPanelsCompositionResultArgs): ChatRecommendationPanelsCompositionSections {
    return {
        departureSettingsSectionProps,
        recommendationResultsSectionProps,
        recommendationMapSectionProps,
    };
}

// grouped args builder: 상위 panels props를 departure/results/map 조합 단위로 먼저 분리합니다.
export function buildChatRecommendationPanelsGroupedArgs({
    meetingMode,
    selectedCategory,
    departureInputMethod,
    departureSearchQueries,
    visibleSavedDepartures,
    selectedSavedDepartureIds,
    selectedDepartureFriendId,
    departureFriendOptions,
    selectedFriendId,
    onShowToast,
    selectedDepartureLabels,
    selectedFriendName,
    recommendationSummary,
    canRecommend,
    onMeetingModeChange,
    onCategoryChange,
    onDepartureInputMethodChange,
    onDepartureSearchQueryChange,
    onDepartureFriendChange,
    onOpenSaveLocationLayer,
    onPinnedDepartureSelect,
    onSavedDepartureSelect,
    onDeleteSavedDeparture,
    onDeleteAllSavedDepartures,
    onUpdateSavedDeparture,
    onRecommend,
    hasRecommendations,
    recommendationCards,
    mapMarkers,
}: BuildChatRecommendationPanelsGroupedArgsArgs): BuildChatRecommendationPanelsGroupedArgsResult {
    return {
        departureCompositionArgs: {
            meetingMode,
            selectedCategory,
            departureInputMethod,
            departureSearchQueries,
            visibleSavedDepartures,
            selectedSavedDepartureIds,
            selectedDepartureFriendId,
            departureFriendOptions,
            selectedFriendId,
            onShowToast,
            selectedDepartureLabels,
            selectedFriendName,
            canRecommend,
            onMeetingModeChange,
            onCategoryChange,
            onDepartureInputMethodChange,
            onDepartureSearchQueryChange,
            onDepartureFriendChange,
            onOpenSaveLocationLayer,
            onPinnedDepartureSelect,
            onSavedDepartureSelect,
            onDeleteSavedDeparture,
            onDeleteAllSavedDepartures,
            onUpdateSavedDeparture,
            onRecommend,
        },
        resultsCompositionArgs: {
            recommendationSummary,
            hasRecommendations,
            meetingMode,
            recommendationCards,
        },
        mapCompositionArgs: {
            recommendationSummary,
            hasRecommendations,
            mapMarkers,
        },
    };
}

// snapshot: origin inputs -> resolved origins -> midpoint -> snapshot input -> result composer 순서로 둡니다.
// origin inputs: 출발 좌표 해석 단계에서 필요한 입력입니다.
export type RecommendationMySharedLocation = (ResolvedLocation & { sharedAt: string }) | null;

export type RecommendationFriendLocation = (ResolvedLocation & { sharedAt: string | null }) | null;

export type BuildRecommendationResultOriginArgs = {
    meetingMode: MeetingMode;
    mySharedLocation: RecommendationMySharedLocation;
    friendLocation: RecommendationFriendLocation;
    departureInputMethod: DepartureInputMethod;
    selectedSavedDepartures: SelectedSavedDepartures;
    pinnedDepartureLabels: DepartureLabels;
    departureSearchQueries: DepartureLabels;
    friendName: string;
};

// resolved origins: 출발 좌표 해석이 끝난 뒤 얻는 좌표 쌍과 그 반환 타입입니다.
export type BuildRecommendationResultResolvedOrigins = {
    myOrigin: ResolvedLocation;
    friendOrigin: ResolvedLocation;
};

export type BuildRecommendationResolvedOriginsResult = BuildRecommendationResultResolvedOrigins;

// midpoint: 두 출발 좌표에서 추천 계산 기준점을 만들 때 쓰는 입력과 결과입니다.
export type RecommendationResultMidpoint = {
    latitude: number;
    longitude: number;
};

export type BuildRecommendationResultMidpointArgs = BuildRecommendationResultResolvedOrigins;

export type BuildRecommendationResultMidpointResult = RecommendationResultMidpoint;

// snapshot input: 최종 snapshot 빌더 직전에 넘길 입력 shape와 반환 타입입니다.
export type BuildRecommendationSnapshotInputArgs = {
    selectedFriend: FriendItem | null;
    selectedCategory: RecommendationCategory;
    myOrigin: ResolvedLocation;
    friendOrigin: ResolvedLocation;
    midpoint: { latitude: number; longitude: number };
    friendName: string;
    meetingMode: MeetingMode;
    selectedDepartureLabels: SelectedDepartureLabels;
};

export type BuildRecommendationSnapshotInputResult = BuildRecommendationSnapshotInputArgs;

// result composer input: recommendation 전체 계산에 필요한 상위 입력입니다.
export type BuildRecommendationResultArgs = {
    meetingMode: MeetingMode; // 추천 기준이 현재 위치인지 약속 출발 위치인지 나타냅니다.
    mySharedLocation: RecommendationMySharedLocation; // 내 현재 공유 위치입니다.
    friendLocation: RecommendationFriendLocation; // 친구 현재 공유 위치입니다.
    selectedFriend: FriendItem | null; // 카드/마커 라벨 생성에 쓰이는 선택된 친구 정보입니다.
    selectedCategory: RecommendationCategory; // 이번 추천에 적용할 장소 카테고리입니다.
    friendName: string; // 주소 해석 및 라벨 생성에 사용하는 친구 이름입니다.
    selectedDepartureLabels: SelectedDepartureLabels; // 최종 선택된 출발 위치 라벨 요약입니다.
    departureInputMethod: DepartureInputMethod; // 출발 위치 입력 방식입니다.
    selectedSavedDepartures: SelectedSavedDepartures; // 저장 위치에서 선택된 실제 출발 위치 객체입니다.
    pinnedDepartureLabels: DepartureLabels; // 지도 핀으로 지정된 출발 위치 라벨입니다.
    departureSearchQueries: DepartureLabels; // 검색 입력 상태 그대로의 주소 문자열입니다.
};

// helper: 출발 좌표를 실제 추천 계산용 origin 좌표로 해석합니다.
export async function buildRecommendationResolvedOrigins({
    meetingMode,
    mySharedLocation,
    friendLocation,
    departureInputMethod,
    selectedSavedDepartures,
    pinnedDepartureLabels,
    departureSearchQueries,
    friendName,
}: BuildRecommendationResultOriginArgs): Promise<BuildRecommendationResolvedOriginsResult> {
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

    return {
        myOrigin,
        friendOrigin,
    };
}

// helper: 해석된 두 origin 좌표로부터 추천 midpoint를 계산합니다.
export function buildRecommendationResultMidpoint({
    myOrigin,
    friendOrigin,
}: BuildRecommendationResultMidpointArgs): BuildRecommendationResultMidpointResult {
    const midpoint = calculateMidpoint([
        { latitude: myOrigin.latitude, longitude: myOrigin.longitude },
        { latitude: friendOrigin.latitude, longitude: friendOrigin.longitude },
    ]);

    if (!midpoint) {
        throw new Error("중심점을 계산하지 못했어요.");
    }

    return midpoint;
}

// composer: snapshot 빌더에 넘길 최종 입력 객체를 조립합니다.
export function buildRecommendationSnapshotInput({
    selectedFriend,
    selectedCategory,
    myOrigin,
    friendOrigin,
    midpoint,
    friendName,
    meetingMode,
    selectedDepartureLabels,
}: BuildRecommendationSnapshotInputArgs): BuildRecommendationSnapshotInputResult {
    return {
        selectedFriend,
        selectedCategory,
        myOrigin,
        friendOrigin,
        midpoint,
        friendName,
        meetingMode,
        selectedDepartureLabels,
    };
}

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
    const { myOrigin, friendOrigin } = await buildRecommendationResolvedOrigins({
        meetingMode,
        mySharedLocation,
        friendLocation,
        departureInputMethod,
        selectedSavedDepartures,
        pinnedDepartureLabels,
        departureSearchQueries,
        friendName,
    });
    const midpoint = buildRecommendationResultMidpoint({ myOrigin, friendOrigin });

    return buildRecommendationSnapshot(buildRecommendationSnapshotInput({
        selectedFriend,
        selectedCategory,
        myOrigin,
        friendOrigin,
        midpoint,
        friendName,
        meetingMode,
        selectedDepartureLabels,
    }));
}