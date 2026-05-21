import type {
    ChatDeparturePartyCardActions,
    ChatDeparturePartyCardSavedListProps,
    ChatDeparturePartyCardSelectionProps,
} from "./chat-departure-party-card";
import type { DepartureParty, ResolvedLocation, SavedDeparture } from "../types";

type SavedDepartureResolvedAddressState = Record<string, {
    // 저장된 출발지 위도입니다.
    latitude: number;
    // 저장된 출발지 경도입니다.
    longitude: number;
    // 저장된 출발지 주소 문자열입니다.
    address: string;
}>;

type BuildDeparturePartyCardSelectionArgs = {
    // 현재 조합 중인 파티입니다.
    party: DepartureParty;
    // 파티별 선택 출발지 라벨 모음입니다.
    selectedDepartureLabels: Record<DepartureParty, string | null> | null;
    // 파티별 주소 검색어 모음입니다.
    departureSearchQueries: Record<DepartureParty, string>;
    // 현재 채팅 상대를 표시할 라벨입니다.
    currentChatFriendLabel: string;
    // 현재 선택된 친구 ID입니다.
    selectedFriendId: string;
    // 현재 선택된 친구 이름입니다.
    selectedFriendName: string;
    // 각 파티의 우편번호 레이어 열림 상태를 확인하는 함수입니다.
    isPostcodeLayerOpenForParty: (party: DepartureParty) => boolean;
};

type BuildDeparturePartyCardSavedListArgs = {
    // 현재 조합 중인 파티입니다.
    party: DepartureParty;
    // 파티별 화면 노출 저장 출발지 목록입니다.
    visibleSavedDepartures: Record<DepartureParty, SavedDeparture[]>;
    // 파티별 선택 저장 출발지 ID입니다.
    selectedSavedDepartureIds: Record<DepartureParty, string>;
    // 친구 필터에서 선택된 친구 ID입니다.
    selectedDepartureFriendId: string;
    // 저장 출발지 필터용 친구 옵션입니다.
    departureFriendOptions: Array<{ id: string; nickname: string }>;
    // 저장 출발지별 좌표와 주소 해석 결과입니다.
    savedDepartureResolvedAddresses: SavedDepartureResolvedAddressState;
    // 파티별 저장 출발지 검색어입니다.
    savedDepartureFilterQueries: Record<DepartureParty, string>;
    // 파티별 우선 노출 개수입니다.
    savedDepartureVisibleCounts: Record<DepartureParty, number>;
    // 표시용 시각 문자열을 만드는 함수입니다.
    formatSavedDepartureDisplayTime: (departure: SavedDeparture) => string;
};

type BuildDeparturePartyCardActionsArgs = {
    // 현재 조합 중인 파티입니다.
    party: DepartureParty;
    // 주소 검색 레이어를 여는 상위 액션입니다.
    onOpenDaumAddressSearch: (party: DepartureParty) => void;
    // 저장 위치 레이어를 여는 상위 액션입니다.
    onOpenSaveLocationLayer: (
        party: DepartureParty,
        previewValue: string,
        sourceLabel: string,
        resolvedLocation?: ResolvedLocation,
        locationKind?: "recent" | "preset",
        targetFriendId?: string,
        targetFriendName?: string,
    ) => void;
    // 핀 선택 레이어를 여는 상위 액션입니다.
    onOpenPinPicker: (party: DepartureParty) => void;
    // 친구 필터 선택을 처리하는 상위 액션입니다.
    onDepartureFriendSelect: (nextFriendId: string) => void;
    // 저장 출발지 검색어 변경을 처리하는 상위 액션입니다.
    onSavedDepartureFilterQueryChange: (party: DepartureParty, nextQuery: string) => void;
    // 전체 삭제를 처리하는 상위 액션입니다.
    onDeleteAllSavedDeparturesClick: (party: DepartureParty) => void;
    // 저장 출발지 선택을 처리하는 상위 액션입니다.
    onSavedDepartureSelectionClick: (party: DepartureParty, departure: SavedDeparture) => void;
    // 지도 미리보기를 여는 상위 액션입니다.
    onOpenSavedDepartureMapLayer: (party: DepartureParty, departure: SavedDeparture) => void;
    // 저장 출발지 수정 레이어를 여는 상위 액션입니다.
    onOpenSavedDepartureEditLayer: (party: DepartureParty, departure: SavedDeparture) => void;
    // 저장 출발지 삭제를 처리하는 상위 액션입니다.
    onDeleteSavedDepartureClick: (party: DepartureParty, departureId: string, departureLabel: string) => void;
    // 더보기 노출을 처리하는 상위 액션입니다.
    onShowMoreSavedDepartures: (party: DepartureParty) => void;
};

export function buildDeparturePartyCardSelection({
    party,
    selectedDepartureLabels,
    departureSearchQueries,
    currentChatFriendLabel,
    selectedFriendId,
    selectedFriendName,
    isPostcodeLayerOpenForParty,
}: BuildDeparturePartyCardSelectionArgs): ChatDeparturePartyCardSelectionProps {
    return {
        selectedDepartureLabel: selectedDepartureLabels?.[party],
        departureSearchQuery: departureSearchQueries[party],
        currentChatFriendLabel,
        selectedFriendId,
        selectedFriendName,
        isPostcodeLayerOpen: isPostcodeLayerOpenForParty(party),
    };
}

export function buildDeparturePartyCardSavedList({
    party,
    visibleSavedDepartures,
    selectedSavedDepartureIds,
    selectedDepartureFriendId,
    departureFriendOptions,
    savedDepartureResolvedAddresses,
    savedDepartureFilterQueries,
    savedDepartureVisibleCounts,
    formatSavedDepartureDisplayTime,
}: BuildDeparturePartyCardSavedListArgs): ChatDeparturePartyCardSavedListProps {
    return {
        visibleSavedDepartures: visibleSavedDepartures[party],
        selectedSavedDepartureId: selectedSavedDepartureIds[party],
        selectedDepartureFriendId,
        departureFriendOptions,
        savedDepartureResolvedAddresses,
        savedDepartureFilterQuery: savedDepartureFilterQueries[party],
        savedDepartureVisibleCount: savedDepartureVisibleCounts[party],
        formatSavedDepartureDisplayTime,
    };
}

export function buildDeparturePartyCardActions({
    party,
    onOpenDaumAddressSearch,
    onOpenSaveLocationLayer,
    onOpenPinPicker,
    onDepartureFriendSelect,
    onSavedDepartureFilterQueryChange,
    onDeleteAllSavedDeparturesClick,
    onSavedDepartureSelectionClick,
    onOpenSavedDepartureMapLayer,
    onOpenSavedDepartureEditLayer,
    onDeleteSavedDepartureClick,
    onShowMoreSavedDepartures,
}: BuildDeparturePartyCardActionsArgs): ChatDeparturePartyCardActions {
    return {
        onOpenDaumAddressSearch,
        onOpenSaveLocationLayer,
        onOpenPinPicker,
        onDepartureFriendSelect,
        onSavedDepartureFilterQueryChange: (nextQuery) => onSavedDepartureFilterQueryChange(party, nextQuery),
        onDeleteAllSavedDeparturesClick: () => onDeleteAllSavedDeparturesClick(party),
        onSavedDepartureSelectionClick: (departure) => onSavedDepartureSelectionClick(party, departure),
        onOpenSavedDepartureMapLayer: (departure) => onOpenSavedDepartureMapLayer(party, departure),
        onOpenSavedDepartureEditLayer: (departure) => onOpenSavedDepartureEditLayer(party, departure),
        onDeleteSavedDepartureClick: (departureId, departureLabel) => onDeleteSavedDepartureClick(party, departureId, departureLabel),
        onShowMoreSavedDepartures: () => onShowMoreSavedDepartures(party),
    };
}