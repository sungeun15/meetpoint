import { useRef, useState } from "react";

import {
    buildDepartureSettingsViewModel,
    formatSavedDepartureDisplayTime,
} from "./chat-departure-settings-helpers";
import {
    buildDepartureSettingsHeaderState,
    buildDepartureSettingsModalHostState,
    buildDepartureSettingsSectionState,
} from "./chat-departure-settings-panel-state-helpers";
import {
    buildDepartureSelectionToastMessage,
    useChatDepartureSettingsActions,
} from "./use-chat-departure-settings-actions";
import { useChatDepartureSettingsOverlays } from "./use-chat-departure-settings-overlays";
import { useChatDepartureSettingsSavedListState } from "./use-chat-departure-settings-saved-list-state";
import { useChatSavedDepartureResolvedAddresses } from "./use-chat-saved-departure-resolved-addresses";
import type {
    DepartureInputMethod,
    DepartureParty,
    MeetingMode,
    RecommendationCategory,
    ResolvedLocation,
    SavedDeparture,
} from "../types";

type UseChatDepartureSettingsPanelStateArgs = {
    // 현재 선택된 만남 모드입니다.
    meetingMode: MeetingMode;
    // 현재 선택된 추천 카테고리입니다.
    selectedCategory: RecommendationCategory;
    // 현재 적용 중인 출발지 입력 방식입니다.
    departureInputMethod: DepartureInputMethod;
    // 파티별 주소 검색어입니다.
    departureSearchQueries: Record<DepartureParty, string>;
    // 파티별 화면 노출 저장 출발지 목록입니다.
    visibleSavedDepartures: Record<DepartureParty, SavedDeparture[]>;
    // 저장 출발지 친구 필터에서 선택된 친구 ID입니다.
    selectedDepartureFriendId: string;
    // 저장 출발지 친구 필터 옵션입니다.
    departureFriendOptions: Array<{ id: string; nickname: string }>;
    // 현재 선택된 친구 이름입니다.
    selectedFriendName: string;
    // 토스트 메시지를 보여주는 상위 콜백입니다.
    onShowToast: (message: string) => void;
    // 주소 검색어를 바꾸는 상위 콜백입니다.
    onDepartureSearchQueryChange: (party: DepartureParty, nextQuery: string) => void;
    // 출발지 친구 선택을 바꾸는 상위 콜백입니다.
    onDepartureFriendChange: (nextFriendId: string) => void;
    // 핀으로 고른 출발지를 확정하는 상위 콜백입니다.
    onPinnedDepartureSelect: (party: DepartureParty, pinnedLocation: ResolvedLocation) => void;
    // 저장 출발지 선택을 처리하는 상위 콜백입니다.
    onSavedDepartureSelect: (party: DepartureParty, departureId: string) => Promise<boolean>;
    // 저장 출발지 하나 삭제를 처리하는 상위 콜백입니다.
    onDeleteSavedDeparture: (party: DepartureParty, departureId: string) => Promise<boolean>;
    // 저장 출발지 전체 삭제를 처리하는 상위 콜백입니다.
    onDeleteAllSavedDepartures: (party: DepartureParty) => Promise<boolean>;
    // 저장 출발지 수정을 처리하는 상위 콜백입니다.
    onUpdateSavedDeparture: (party: DepartureParty, departureId: string, title: string, resolvedLocation: ResolvedLocation) => Promise<boolean>;
};

export function useChatDepartureSettingsPanelState({
    meetingMode,
    selectedCategory,
    departureInputMethod,
    departureSearchQueries,
    visibleSavedDepartures,
    selectedDepartureFriendId,
    departureFriendOptions,
    selectedFriendName,
    onShowToast,
    onDepartureSearchQueryChange,
    onDepartureFriendChange,
    onPinnedDepartureSelect,
    onSavedDepartureSelect,
    onDeleteSavedDeparture,
    onDeleteAllSavedDepartures,
    onUpdateSavedDeparture,
}: UseChatDepartureSettingsPanelStateArgs) {
    const postcodeContainerRef = useRef<HTMLDivElement | null>(null);
    const savedDepartureMapContainerRef = useRef<HTMLDivElement | null>(null);
    const [isMobileSettingsCollapsed, setIsMobileSettingsCollapsed] = useState(true);
    const {
        savedDepartureVisibleCounts,
        setSavedDepartureVisibleCounts,
        savedDepartureFilterQueries,
        setSavedDepartureFilterQueries,
    } = useChatDepartureSettingsSavedListState();

    const {
        selectedDepartureFriendLabel,
        currentChatFriendLabel,
        departurePartyLabels,
        mobileSettingsSummary,
    } = buildDepartureSettingsViewModel({
        meetingMode,
        selectedCategory,
        departureInputMethod,
        selectedDepartureFriendId,
        departureFriendOptions,
        selectedFriendName,
    });

    const overlays = useChatDepartureSettingsOverlays({
        postcodeContainerRef,
        savedDepartureMapContainerRef,
        departurePartyLabels,
        departureSearchQueries,
        selectedDepartureFriendLabel,
        onDepartureSearchQueryChange,
        onSearchAddressSelected: (party, address) => {
            onShowToast(buildDepartureSelectionToastMessage(
                party,
                address,
                "search",
                selectedFriendName,
            ));
        },
    });

    const { savedDepartureResolvedAddresses } = useChatSavedDepartureResolvedAddresses({
        visibleSavedDepartures,
    });

    const actions = useChatDepartureSettingsActions({
        pinPickerLayerState: overlays.pinPickerLayerState,
        deleteConfirmationState: overlays.deleteConfirmationState,
        selectedFriendName,
        onShowToast,
        onPinnedDepartureSelect,
        onSavedDepartureSelect,
        onDeleteSavedDeparture,
        onDeleteAllSavedDepartures,
        onUpdateSavedDeparture,
        onDepartureFriendChange,
        setPinPickerLayerState: overlays.setPinPickerLayerState,
        setDeleteConfirmationState: overlays.setDeleteConfirmationState,
        setSavedDepartureVisibleCounts,
        setSavedDepartureFilterQueries,
    });

    const savedDepartureResolvedAddress = overlays.savedDepartureMapLayerState
        ? (savedDepartureResolvedAddresses[overlays.savedDepartureMapLayerState.departure.id]?.address
            ?? overlays.savedDepartureMapLayerState.departure.address)
        : null;
    const savedDepartureMapTimeLabel = overlays.savedDepartureMapLayerState
        ? formatSavedDepartureDisplayTime(overlays.savedDepartureMapLayerState.departure)
        : null;

    function toggleMobileSettings() {
        setIsMobileSettingsCollapsed((currentValue) => !currentValue);
    }

    return {
        header: buildDepartureSettingsHeaderState({
            isMobileSettingsCollapsed,
            mobileSettingsSummary,
            toggleMobileSettings,
        }),
        departureSection: buildDepartureSettingsSectionState({
            selectedDepartureFriendLabel,
            currentChatFriendLabel,
            departurePartyLabels,
            postcodeFeedbackMessage: overlays.postcodeFeedbackMessage,
            savedDepartureVisibleCounts,
            savedDepartureFilterQueries,
            savedDepartureResolvedAddresses,
            formatSavedDepartureDisplayTime,
            isPostcodeLayerOpenForParty: (party: DepartureParty) => overlays.postcodeLayerState?.party === party,
            onOpenDaumAddressSearch: overlays.handleOpenDaumAddressSearch,
            onOpenPinPicker: overlays.handleOpenPinPicker,
            onDepartureFriendSelect: actions.handleDepartureFriendSelect,
            onSavedDepartureFilterQueryChange: actions.handleSavedDepartureFilterQueryChange,
            onDeleteAllSavedDeparturesClick: overlays.handleDeleteAllSavedDeparturesClick,
            onSavedDepartureSelectionClick: actions.handleSavedDepartureSelectionClick,
            onOpenSavedDepartureMapLayer: overlays.handleOpenSavedDepartureMapLayer,
            onOpenSavedDepartureEditLayer: overlays.handleOpenSavedDepartureEditLayer,
            onDeleteSavedDepartureClick: overlays.handleDeleteSavedDepartureClick,
            onShowMoreSavedDepartures: actions.handleShowMoreSavedDepartures,
        }),
        modalHost: {
            ...buildDepartureSettingsModalHostState({
                postcodeLayerState: overlays.postcodeLayerState,
                pinPickerLayerState: overlays.pinPickerLayerState,
                deleteConfirmationState: overlays.deleteConfirmationState,
                savedDepartureMapLayerState: overlays.savedDepartureMapLayerState,
                savedDepartureMapErrorMessage: overlays.savedDepartureMapErrorMessage,
                departurePartyLabels,
                savedDepartureResolvedAddress,
                savedDepartureMapTimeLabel,
                onClosePostcodeLayer: () => overlays.setPostcodeLayerState(null),
                onClosePinPickerLayer: () => overlays.setPinPickerLayerState(null),
                onCloseDeleteConfirmation: () => overlays.setDeleteConfirmationState(null),
                onCloseSavedDepartureMapLayer: () => overlays.setSavedDepartureMapLayerState(null),
                onConfirmPinnedAddress: actions.handleConfirmPinnedAddress,
                onConfirmDelete: actions.handleConfirmDelete,
            }),
            postcodeContainerRef,
            savedDepartureMapContainerRef,
        },
    };
}