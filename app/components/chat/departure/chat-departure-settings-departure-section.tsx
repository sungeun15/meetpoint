import { friendsBodyFont, friendsDisplayFont } from "../../friends/fonts";

import {
    departureMethodOptions,
    departurePartyMeta,
} from "./chat-departure-settings-helpers";
import {
    ChatDeparturePartyCard,
} from "./chat-departure-party-card";
import {
    buildDeparturePartyCardActions,
    buildDeparturePartyCardSavedList,
    buildDeparturePartyCardSelection,
} from "./chat-departure-settings-departure-section-helpers";
import { buildDeparturePartyTitle } from "./chat-departure-settings-helpers";
import { mergeClassNames } from "../class-names";
import type { DepartureInputMethod, DepartureParty, ResolvedLocation, SavedDeparture } from "../types";

type SavedDepartureResolvedAddressState = Record<string, {
    // 저장된 출발지 위도입니다.
    latitude: number;
    // 저장된 출발지 경도입니다.
    longitude: number;
    // 저장된 출발지 주소 문자열입니다.
    address: string;
}>;

type ChatDepartureSettingsDepartureSectionProps = {
    // departure section 렌더링에 필요한 화면 상태 묶음입니다.
    viewState: ChatDepartureSettingsDepartureSectionViewState;
    // departure section에서 호출할 액션 묶음입니다.
    actions: ChatDepartureSettingsDepartureSectionActions;
};

type ChatDepartureSettingsDepartureSectionViewState = {
    // 현재 적용 중인 출발지 입력 방식입니다.
    departureInputMethod: DepartureInputMethod;
    // 저장 출발지 모드에서 친구 출발지 라벨로 쓸 문구입니다.
    selectedDepartureFriendLabel: string;
    // 현재 채팅 상대를 표시할 라벨입니다.
    currentChatFriendLabel: string;
    // 파티별 출발지 라벨입니다.
    departurePartyLabels: Record<DepartureParty, string>;
    // 주소 검색 모드에서 보여줄 안내 메시지입니다.
    postcodeFeedbackMessage: string | null;
    // 파티별 현재 선택 출발지 라벨입니다.
    selectedDepartureLabels: Record<DepartureParty, string | null> | null;
    // 파티별 주소 검색어입니다.
    departureSearchQueries: Record<DepartureParty, string>;
    // 현재 선택된 친구 ID입니다.
    selectedFriendId: string;
    // 현재 선택된 친구 이름입니다.
    selectedFriendName: string;
    // 파티별 선택된 저장 출발지 ID입니다.
    selectedSavedDepartureIds: Record<DepartureParty, string>;
    // 저장 출발지 친구 필터에 선택된 친구 ID입니다.
    selectedDepartureFriendId: string;
    // 저장 출발지 필터용 친구 옵션입니다.
    departureFriendOptions: Array<{ id: string; nickname: string }>;
    // 파티별 노출 저장 출발지 목록입니다.
    visibleSavedDepartures: Record<DepartureParty, SavedDeparture[]>;
    // 저장 출발지별 주소 해석 결과입니다.
    savedDepartureResolvedAddresses: SavedDepartureResolvedAddressState;
    // 파티별 저장 출발지 검색어입니다.
    savedDepartureFilterQueries: Record<DepartureParty, string>;
    // 파티별 우선 노출 개수입니다.
    savedDepartureVisibleCounts: Record<DepartureParty, number>;
    // 특정 파티의 우편번호 레이어가 열려 있는지 확인합니다.
    isPostcodeLayerOpenForParty: (party: DepartureParty) => boolean;
    // 저장 출발지의 표시용 시각 문자열을 만듭니다.
    formatSavedDepartureDisplayTime: (departure: SavedDeparture) => string;
};

type ChatDepartureSettingsDepartureSectionActions = {
    // 출발지 입력 방식을 바꿉니다.
    onDepartureInputMethodChange: (nextMethod: DepartureInputMethod) => void;
    // 주소 검색 레이어를 엽니다.
    onOpenDaumAddressSearch: (party: DepartureParty) => void;
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
    // 저장 출발지 목록을 더 보여줍니다.
    onShowMoreSavedDepartures: (party: DepartureParty) => void;
};

export function ChatDepartureSettingsDepartureSection({
    viewState: {
        departureInputMethod,
        selectedDepartureFriendLabel,
        currentChatFriendLabel,
        departurePartyLabels,
        postcodeFeedbackMessage,
        selectedDepartureLabels,
        departureSearchQueries,
        selectedFriendId,
        selectedFriendName,
        selectedSavedDepartureIds,
        selectedDepartureFriendId,
        departureFriendOptions,
        visibleSavedDepartures,
        savedDepartureResolvedAddresses,
        savedDepartureFilterQueries,
        savedDepartureVisibleCounts,
        isPostcodeLayerOpenForParty,
        formatSavedDepartureDisplayTime,
    },
    actions: {
        onDepartureInputMethodChange,
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
    },
}: ChatDepartureSettingsDepartureSectionProps) {
    return (
        <div className="rounded-[18px] bg-white/72 px-3.5 py-3.5 shadow-[0px_12px_24px_rgba(52,41,104,0.08)] sm:px-4 sm:py-4">
            <p className={`${friendsDisplayFont.className} text-[13px] text-[#111827] sm:text-[16px]`}>
                출발 위치
            </p>
            <p className={`${friendsBodyFont.className} mt-1.5 break-keep text-[11px] leading-[1.6] text-[#6b7280] sm:mt-2 sm:text-[13px]`}>
                나중에 만나기에서는 내 출발 위치와 {departureInputMethod === "saved" ? selectedDepartureFriendLabel : currentChatFriendLabel} 님 출발 위치를 각각 정해야 추천 기준이 완성돼요.
            </p>

            {departureInputMethod === "search" && postcodeFeedbackMessage ? (
                <div className="mt-3 rounded-[14px] border border-[#d9d4ff] bg-white/70 px-3.5 py-2.5 sm:px-4 sm:py-3">
                    <p className={`${friendsBodyFont.className} text-[11px] leading-[1.55] text-[#5b43d6] sm:text-[13px]`}>
                        {postcodeFeedbackMessage}
                    </p>
                </div>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2">
                {departureMethodOptions.map((option) => {
                    const isSelected = departureInputMethod === option.id;

                    return (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => onDepartureInputMethodChange(option.id)}
                            className={mergeClassNames(
                                `${friendsBodyFont.className} rounded-full border px-2.5 py-1.5 text-[11px] transition-colors sm:px-3 sm:text-[13px]`,
                                isSelected
                                    ? "border-[#6c5ce7] bg-[#f5f1ff] text-[#5b43d6]"
                                    : "border-white/60 bg-white/80 text-[#6b7280] hover:bg-white",
                            )}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {departurePartyMeta.map((party) => (
                    <ChatDeparturePartyCard
                        key={party.id}
                        party={party.id}
                        partyLabel={party.label}
                        departurePartyLabel={departurePartyLabels[party.id]}
                        displayedPartyTitle={buildDeparturePartyTitle(
                            party.id,
                            party.label,
                            departureInputMethod,
                            selectedDepartureFriendLabel,
                            currentChatFriendLabel,
                        )}
                        departureInputMethod={departureInputMethod}
                        selection={buildDeparturePartyCardSelection({
                            party: party.id,
                            selectedDepartureLabels,
                            departureSearchQueries,
                            currentChatFriendLabel,
                            selectedFriendId,
                            selectedFriendName,
                            isPostcodeLayerOpenForParty,
                        })}
                        savedList={buildDeparturePartyCardSavedList({
                            party: party.id,
                            visibleSavedDepartures,
                            selectedSavedDepartureIds,
                            selectedDepartureFriendId,
                            departureFriendOptions,
                            savedDepartureResolvedAddresses,
                            savedDepartureFilterQueries,
                            savedDepartureVisibleCounts,
                            formatSavedDepartureDisplayTime,
                        })}
                        actions={buildDeparturePartyCardActions({
                            party: party.id,
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
                        })}
                    />
                ))}
            </div>
        </div>
    );
}