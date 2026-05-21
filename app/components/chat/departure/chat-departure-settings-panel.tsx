import Image from "next/image";

import { buildDepartureSettingsGuideCopy } from "../recommendation/chat-recommendation-copy";
import {
    categoryOptions,
    modeOptions,
} from "./chat-departure-settings-helpers";
import { ChatDepartureSettingsDepartureSection } from "./chat-departure-settings-departure-section";
import { ChatDepartureSettingsHeader } from "./chat-departure-settings-header";
import { ChatDepartureSettingsModalHost } from "./chat-departure-settings-modal-host";
import { ChatSelectableOptionSection } from "../chat-selectable-option-section";
import { ChatSectionCard } from "../chat-ui";
import { useChatDepartureSettingsPanelState } from "./use-chat-departure-settings-panel-state";
import type {
    DepartureInputMethod,
    DepartureParty,
    MeetingMode,
    RecommendationCategory,
    ResolvedLocation,
    SavedDeparture,
} from "../types";

export type ChatDepartureSettingsPanelViewState = {
    // 현재 선택된 만남 모드입니다.
    meetingMode: MeetingMode;
    // 현재 선택된 추천 카테고리입니다.
    selectedCategory: RecommendationCategory;
    // 현재 적용 중인 출발지 입력 방식입니다.
    departureInputMethod: DepartureInputMethod;
    // 파티별 주소 검색어입니다.
    departureSearchQueries: Record<DepartureParty, string>;
    // 파티별 화면에 노출할 저장 출발지 목록입니다.
    visibleSavedDepartures: Record<DepartureParty, SavedDeparture[]>;
    // 파티별 선택된 저장 출발지 ID입니다.
    selectedSavedDepartureIds: Record<DepartureParty, string>;
    // 저장 출발지 친구 필터에서 선택된 친구 ID입니다.
    selectedDepartureFriendId: string;
    // 저장 출발지 친구 필터 옵션입니다.
    departureFriendOptions: Array<{ id: string; nickname: string }>;
    // 현재 선택된 친구 ID입니다.
    selectedFriendId: string;
    // 파티별 현재 선택 출발지 라벨입니다.
    selectedDepartureLabels: Record<DepartureParty, string | null> | null;
    // 현재 선택된 친구 이름입니다.
    selectedFriendName: string;
    // 추천을 실행할 수 있는 상태인지 나타냅니다.
    canRecommend: boolean;
};

export type ChatDepartureSettingsPanelActions = {
    // 사용자에게 토스트 메시지를 보여줍니다.
    onShowToast: (message: string) => void;
    // 만남 모드를 바꿉니다.
    onMeetingModeChange: (nextMode: MeetingMode) => void;
    // 추천 카테고리를 바꿉니다.
    onCategoryChange: (nextCategory: RecommendationCategory) => void;
    // 출발지 입력 방식을 바꿉니다.
    onDepartureInputMethodChange: (nextMethod: DepartureInputMethod) => void;
    // 주소 검색어를 바꿉니다.
    onDepartureSearchQueryChange: (party: DepartureParty, nextQuery: string) => void;
    // 출발지 친구 선택을 바꿉니다.
    onDepartureFriendChange: (nextFriendId: string) => void;
    // 저장 위치 레이어를 엽니다.
    onOpenSaveLocationLayer: (
        party: DepartureParty,
        previewValue: string,
        sourceLabel: string,
        resolvedLocation?: ResolvedLocation,
        locationKind?: "recent" | "preset",
        targetFriendId?: string,
        targetFriendName?: string,
    ) => void;
    // 핀으로 고른 출발지를 확정합니다.
    onPinnedDepartureSelect: (party: DepartureParty, pinnedLocation: ResolvedLocation) => void;
    // 저장 출발지를 선택합니다.
    onSavedDepartureSelect: (party: DepartureParty, departureId: string) => Promise<boolean>;
    // 저장 출발지 하나를 삭제합니다.
    onDeleteSavedDeparture: (party: DepartureParty, departureId: string) => Promise<boolean>;
    // 현재 파티의 저장 출발지를 전체 삭제합니다.
    onDeleteAllSavedDepartures: (party: DepartureParty) => Promise<boolean>;
    // 저장 출발지 제목과 위치를 수정합니다.
    onUpdateSavedDeparture: (party: DepartureParty, departureId: string, title: string, resolvedLocation: ResolvedLocation) => Promise<boolean>;
    // 현재 조건으로 추천을 실행합니다.
    onRecommend: () => void;
};

type ChatDepartureSettingsPanelProps = {
    // 패널 렌더링에 필요한 화면 상태 묶음입니다.
    viewState: ChatDepartureSettingsPanelViewState;
    // 패널에서 호출할 액션 묶음입니다.
    actions: ChatDepartureSettingsPanelActions;
};

export function ChatDepartureSettingsPanel({
    viewState: {
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
    },
    actions: {
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
    },
}: ChatDepartureSettingsPanelProps) {
    const {
        header,
        departureSection,
        modalHost,
    } = useChatDepartureSettingsPanelState({
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
    });

    return (
        <ChatSectionCard tone="accent" className="relative overflow-hidden px-3.5 py-4 sm:px-5 sm:py-5 lg:px-6 xl:px-7">
            <Image
                alt="Background pattern"
                src="/imports/Frame3/background-pattern.svg"
                width={420}
                height={220}
                loading="eager"
                className="absolute bottom-0 right-0 h-auto w-45 opacity-20 sm:w-60 lg:w-85"
            />

            <div className="relative z-10 space-y-3.5 sm:space-y-4">
                <ChatDepartureSettingsHeader
                    guideCopy={buildDepartureSettingsGuideCopy()}
                    isMobileSettingsCollapsed={header.isMobileSettingsCollapsed}
                    mobileSettingsSummary={header.mobileSettingsSummary}
                    canRecommend={canRecommend}
                    onToggleMobileSettings={header.toggleMobileSettings}
                    onRecommend={onRecommend}
                />

                <div className={`${header.isMobileSettingsCollapsed ? "hidden" : "grid"} gap-3 lg:grid`}>
                    <ChatSelectableOptionSection
                        title="만남 모드"
                        options={modeOptions}
                        selectedId={meetingMode}
                        onSelect={onMeetingModeChange}
                        columnsClassName="sm:grid-cols-2"
                        optionTitleClassName="text-[15px] text-[#111827] sm:text-[17px]"
                    />

                    {meetingMode === "later" ? (
                        <ChatDepartureSettingsDepartureSection
                            viewState={{
                                departureInputMethod,
                                selectedDepartureFriendLabel: departureSection.selectedDepartureFriendLabel,
                                currentChatFriendLabel: departureSection.currentChatFriendLabel,
                                departurePartyLabels: departureSection.departurePartyLabels,
                                postcodeFeedbackMessage: departureSection.postcodeFeedbackMessage,
                                selectedDepartureLabels,
                                departureSearchQueries,
                                selectedFriendId,
                                selectedFriendName,
                                selectedSavedDepartureIds,
                                selectedDepartureFriendId,
                                departureFriendOptions,
                                visibleSavedDepartures,
                                savedDepartureResolvedAddresses: departureSection.savedDepartureResolvedAddresses,
                                savedDepartureFilterQueries: departureSection.savedDepartureFilterQueries,
                                savedDepartureVisibleCounts: departureSection.savedDepartureVisibleCounts,
                                isPostcodeLayerOpenForParty: departureSection.isPostcodeLayerOpenForParty,
                                formatSavedDepartureDisplayTime: departureSection.formatSavedDepartureDisplayTime,
                            }}
                            actions={{
                                onDepartureInputMethodChange,
                                onOpenDaumAddressSearch: departureSection.onOpenDaumAddressSearch,
                                onOpenSaveLocationLayer,
                                onOpenPinPicker: departureSection.onOpenPinPicker,
                                onDepartureFriendSelect: departureSection.onDepartureFriendSelect,
                                onSavedDepartureFilterQueryChange: departureSection.onSavedDepartureFilterQueryChange,
                                onDeleteAllSavedDeparturesClick: departureSection.onDeleteAllSavedDeparturesClick,
                                onSavedDepartureSelectionClick: departureSection.onSavedDepartureSelectionClick,
                                onOpenSavedDepartureMapLayer: departureSection.onOpenSavedDepartureMapLayer,
                                onOpenSavedDepartureEditLayer: departureSection.onOpenSavedDepartureEditLayer,
                                onDeleteSavedDepartureClick: departureSection.onDeleteSavedDepartureClick,
                                onShowMoreSavedDepartures: departureSection.onShowMoreSavedDepartures,
                            }}
                        />
                    ) : null}

                    <ChatSelectableOptionSection
                        title="카테고리"
                        options={categoryOptions}
                        selectedId={selectedCategory}
                        onSelect={onCategoryChange}
                        columnsClassName="sm:grid-cols-3"
                        optionTitleClassName="text-[14px] text-[#111827] sm:text-[16px]"
                    />
                </div>
            </div>

            <ChatDepartureSettingsModalHost
                postcodeLayerState={modalHost.postcodeLayerState}
                pinPickerLayerState={modalHost.pinPickerLayerState}
                deleteConfirmationState={modalHost.deleteConfirmationState}
                savedDepartureMapLayerState={modalHost.savedDepartureMapLayerState}
                savedDepartureMapErrorMessage={modalHost.savedDepartureMapErrorMessage}
                departurePartyLabels={modalHost.departurePartyLabels}
                savedDepartureResolvedAddress={modalHost.savedDepartureResolvedAddress}
                savedDepartureMapTimeLabel={modalHost.savedDepartureMapTimeLabel}
                postcodeContainerRef={modalHost.postcodeContainerRef}
                savedDepartureMapContainerRef={modalHost.savedDepartureMapContainerRef}
                onClosePostcodeLayer={modalHost.onClosePostcodeLayer}
                onClosePinPickerLayer={modalHost.onClosePinPickerLayer}
                onCloseDeleteConfirmation={modalHost.onCloseDeleteConfirmation}
                onCloseSavedDepartureMapLayer={modalHost.onCloseSavedDepartureMapLayer}
                onConfirmPinnedAddress={modalHost.onConfirmPinnedAddress}
                onConfirmDelete={modalHost.onConfirmDelete}
            />
        </ChatSectionCard>
    );
}