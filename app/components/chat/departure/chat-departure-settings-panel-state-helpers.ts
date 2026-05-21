import type {
    DeleteConfirmationState,
    PinPickerLayerState,
    PostcodeLayerState,
    SavedDepartureMapLayerState,
} from "./use-chat-departure-settings-overlays";
import type { DepartureParty, ResolvedLocation, SavedDeparture } from "../types";

export type SavedDepartureResolvedAddressState = Record<string, {
    // 저장된 출발지 위도입니다.
    latitude: number;
    // 저장된 출발지 경도입니다.
    longitude: number;
    // 저장된 출발지 주소 문자열입니다.
    address: string;
}>;

export type BuildHeaderStateArgs = {
    // 모바일에서 설정 영역이 접혀 있는지 나타냅니다.
    isMobileSettingsCollapsed: boolean;
    // 접힘 상태에서 보여줄 한 줄 요약 문구입니다.
    mobileSettingsSummary: string;
    // 모바일 설정 영역 접힘 상태를 토글합니다.
    toggleMobileSettings: () => void;
};

export type BuildDepartureSectionStateArgs = {
    // 저장 출발지 모드에서 친구 출발지 라벨로 쓸 문구입니다.
    selectedDepartureFriendLabel: string;
    // 현재 채팅 상대를 화면에 표시할 라벨입니다.
    currentChatFriendLabel: string;
    // 파티별 출발지 라벨입니다.
    departurePartyLabels: Record<DepartureParty, string>;
    // 주소 검색 모드에서 보여줄 안내 메시지입니다.
    postcodeFeedbackMessage: string | null;
    // 파티별 저장 출발지 우선 노출 개수입니다.
    savedDepartureVisibleCounts: Record<DepartureParty, number>;
    // 파티별 저장 출발지 검색어입니다.
    savedDepartureFilterQueries: Record<DepartureParty, string>;
    // 저장 출발지별 주소 해석 결과입니다.
    savedDepartureResolvedAddresses: SavedDepartureResolvedAddressState;
    // 저장 출발지의 표시용 시각 문자열을 만듭니다.
    formatSavedDepartureDisplayTime: (departure: SavedDeparture) => string;
    // 특정 파티의 우편번호 레이어가 열려 있는지 확인합니다.
    isPostcodeLayerOpenForParty: (party: DepartureParty) => boolean;
    // 주소 검색 레이어를 엽니다.
    onOpenDaumAddressSearch: (party: DepartureParty) => void;
    // 지도 핀 선택 레이어를 엽니다.
    onOpenPinPicker: (party: DepartureParty) => void;
    // 저장 출발지 친구 필터를 바꿉니다.
    onDepartureFriendSelect: (nextFriendId: string) => void;
    // 저장 출발지 검색어를 바꿉니다.
    onSavedDepartureFilterQueryChange: (party: DepartureParty, nextQuery: string) => void;
    // 현재 파티의 저장 출발지를 전체 삭제합니다.
    onDeleteAllSavedDeparturesClick: (party: DepartureParty) => void;
    // 저장 출발지를 현재 출발지로 선택합니다.
    onSavedDepartureSelectionClick: (party: DepartureParty, departure: SavedDeparture) => void;
    // 저장 출발지 지도 미리보기를 엽니다.
    onOpenSavedDepartureMapLayer: (party: DepartureParty, departure: SavedDeparture) => void;
    // 저장 출발지 수정 레이어를 엽니다.
    onOpenSavedDepartureEditLayer: (party: DepartureParty, departure: SavedDeparture) => void;
    // 저장 출발지 하나를 삭제합니다.
    onDeleteSavedDepartureClick: (party: DepartureParty, departureId: string, departureLabel: string) => void;
    // 저장 출발지 목록을 더 노출합니다.
    onShowMoreSavedDepartures: (party: DepartureParty) => void;
};

export type BuildModalHostStateArgs = {
    // 주소 검색 레이어 상태입니다.
    postcodeLayerState: PostcodeLayerState | null;
    // 핀 선택 레이어 상태입니다.
    pinPickerLayerState: PinPickerLayerState | null;
    // 삭제 확인 모달 상태입니다.
    deleteConfirmationState: DeleteConfirmationState | null;
    // 저장 출발지 지도 레이어 상태입니다.
    savedDepartureMapLayerState: SavedDepartureMapLayerState | null;
    // 저장 출발지 지도 레이어에서 보여줄 오류 메시지입니다.
    savedDepartureMapErrorMessage: string | null;
    // 파티별 화면 표시 라벨입니다.
    departurePartyLabels: Record<DepartureParty, string>;
    // 현재 저장 출발지의 해석된 주소입니다.
    savedDepartureResolvedAddress: string | null;
    // 저장 출발지 지도 모달에 표시할 시각 라벨입니다.
    savedDepartureMapTimeLabel: string | null;
    // 주소 검색 레이어를 닫습니다.
    onClosePostcodeLayer: () => void;
    // 핀 선택 레이어를 닫습니다.
    onClosePinPickerLayer: () => void;
    // 삭제 확인 모달을 닫습니다.
    onCloseDeleteConfirmation: () => void;
    // 저장 출발지 지도 레이어를 닫습니다.
    onCloseSavedDepartureMapLayer: () => void;
    // 핀으로 고른 위치를 확정합니다.
    onConfirmPinnedAddress: (location: ResolvedLocation, nextTitle?: string) => void;
    // 삭제 확인 동작을 실행합니다.
    onConfirmDelete: () => void | Promise<void>;
};

export function buildDepartureSettingsHeaderState({
    isMobileSettingsCollapsed,
    mobileSettingsSummary,
    toggleMobileSettings,
}: BuildHeaderStateArgs) {
    return {
        isMobileSettingsCollapsed,
        mobileSettingsSummary,
        toggleMobileSettings,
    };
}

export function buildDepartureSettingsSectionState({
    selectedDepartureFriendLabel,
    currentChatFriendLabel,
    departurePartyLabels,
    postcodeFeedbackMessage,
    savedDepartureVisibleCounts,
    savedDepartureFilterQueries,
    savedDepartureResolvedAddresses,
    formatSavedDepartureDisplayTime,
    isPostcodeLayerOpenForParty,
    onOpenDaumAddressSearch,
    onOpenPinPicker,
    onDepartureFriendSelect,
    onSavedDepartureFilterQueryChange,
    onDeleteAllSavedDeparturesClick,
    onSavedDepartureSelectionClick,
    onOpenSavedDepartureMapLayer,
    onOpenSavedDepartureEditLayer,
    onDeleteSavedDepartureClick,
    onShowMoreSavedDepartures,
}: BuildDepartureSectionStateArgs) {
    return {
        selectedDepartureFriendLabel,
        currentChatFriendLabel,
        departurePartyLabels,
        postcodeFeedbackMessage,
        savedDepartureVisibleCounts,
        savedDepartureFilterQueries,
        savedDepartureResolvedAddresses,
        formatSavedDepartureDisplayTime,
        isPostcodeLayerOpenForParty,
        onOpenDaumAddressSearch,
        onOpenPinPicker,
        onDepartureFriendSelect,
        onSavedDepartureFilterQueryChange,
        onDeleteAllSavedDeparturesClick,
        onSavedDepartureSelectionClick,
        onOpenSavedDepartureMapLayer,
        onOpenSavedDepartureEditLayer,
        onDeleteSavedDepartureClick,
        onShowMoreSavedDepartures,
    };
}

export function buildDepartureSettingsModalHostState({
    postcodeLayerState,
    pinPickerLayerState,
    deleteConfirmationState,
    savedDepartureMapLayerState,
    savedDepartureMapErrorMessage,
    departurePartyLabels,
    savedDepartureResolvedAddress,
    savedDepartureMapTimeLabel,
    onClosePostcodeLayer,
    onClosePinPickerLayer,
    onCloseDeleteConfirmation,
    onCloseSavedDepartureMapLayer,
    onConfirmPinnedAddress,
    onConfirmDelete,
}: BuildModalHostStateArgs) {
    return {
        postcodeLayerState,
        pinPickerLayerState,
        deleteConfirmationState,
        savedDepartureMapLayerState,
        savedDepartureMapErrorMessage,
        departurePartyLabels,
        savedDepartureResolvedAddress,
        savedDepartureMapTimeLabel,
        onClosePostcodeLayer,
        onClosePinPickerLayer,
        onCloseDeleteConfirmation,
        onCloseSavedDepartureMapLayer,
        onConfirmPinnedAddress,
        onConfirmDelete,
    };
}