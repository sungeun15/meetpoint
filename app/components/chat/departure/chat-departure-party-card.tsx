import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../../friends/fonts";
import { ChatSavedDepartureListSection } from "./chat-saved-departure-list-section";
import { ChatActionButton } from "../chat-ui";
import { mergeClassNames } from "../class-names";
import type {
    DepartureInputMethod,
    DepartureParty,
    ResolvedLocation,
    SavedDeparture,
} from "../types";

type SavedDepartureResolvedAddressState = Record<string, {
    // 저장된 출발지 위도입니다.
    latitude: number;
    // 저장된 출발지 경도입니다.
    longitude: number;
    // 저장된 출발지의 해석된 주소 문자열입니다.
    address: string;
}>;

export type ChatDeparturePartyCardSelectionProps = {
    // 현재 선택된 출발지 라벨입니다.
    selectedDepartureLabel: string | null | undefined;
    // 주소 검색 모드에서 보여줄 검색어입니다.
    departureSearchQuery: string;
    // 현재 채팅 상대를 화면 문구에 표시할 때 쓰는 라벨입니다.
    currentChatFriendLabel: string;
    // 친구 출발지 저장 시 넘길 대상 친구 ID입니다.
    selectedFriendId: string;
    // 친구 출발지 저장 시 넘길 대상 친구 이름입니다.
    selectedFriendName: string;
    // 현재 파티에 대한 우편번호 검색 레이어가 열려 있는지 나타냅니다.
    isPostcodeLayerOpen: boolean;
};

export type ChatDeparturePartyCardSavedListProps = {
    // 현재 카드에 노출할 저장 출발지 목록입니다.
    visibleSavedDepartures: SavedDeparture[];
    // 현재 선택된 저장 출발지 ID입니다.
    selectedSavedDepartureId: string;
    // 저장 출발지를 친구 기준으로 필터링할 때 선택된 친구 ID입니다.
    selectedDepartureFriendId: string;
    // 저장 출발지 필터 드롭다운에 쓸 친구 옵션입니다.
    departureFriendOptions: Array<{ id: string; nickname: string }>;
    // 저장 출발지별 좌표와 주소 해석 결과입니다.
    savedDepartureResolvedAddresses: SavedDepartureResolvedAddressState;
    // 저장 출발지 목록 검색어입니다.
    savedDepartureFilterQuery: string;
    // 현재 화면에 우선 노출할 저장 출발지 개수입니다.
    savedDepartureVisibleCount: number;
    // 저장 출발지의 표시용 시각 문자열을 만드는 함수입니다.
    formatSavedDepartureDisplayTime: (departure: SavedDeparture) => string;
};

export type ChatDeparturePartyCardActions = {
    // 다음 주소 검색 레이어를 엽니다.
    onOpenDaumAddressSearch: (party: DepartureParty) => void;
    // 현재 선택값을 저장 위치 레이어로 넘깁니다.
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
    // 저장 출발지 목록에서 친구 필터를 바꿉니다.
    onDepartureFriendSelect: (nextFriendId: string) => void;
    // 저장 출발지 검색어를 바꿉니다.
    onSavedDepartureFilterQueryChange: (nextQuery: string) => void;
    // 현재 파티의 저장 출발지를 전체 삭제합니다.
    onDeleteAllSavedDeparturesClick: () => void;
    // 저장 출발지를 현재 출발지로 선택합니다.
    onSavedDepartureSelectionClick: (departure: SavedDeparture) => void;
    // 저장 출발지 지도 미리보기 레이어를 엽니다.
    onOpenSavedDepartureMapLayer: (departure: SavedDeparture) => void;
    // 저장 출발지 수정 레이어를 엽니다.
    onOpenSavedDepartureEditLayer: (departure: SavedDeparture) => void;
    // 저장 출발지 하나를 삭제합니다.
    onDeleteSavedDepartureClick: (departureId: string, departureLabel: string) => void;
    // 저장 출발지 목록을 더 많이 노출합니다.
    onShowMoreSavedDepartures: () => void;
};

type ChatDeparturePartyCardProps = {
    // 내 출발지인지 친구 출발지인지 나타냅니다.
    party: DepartureParty;
    // 카드 내부 문구에 쓸 기본 파티 라벨입니다.
    partyLabel: string;
    // 현재 입력 방식에 맞춘 출발지 라벨입니다.
    departurePartyLabel: string;
    // 카드 상단 제목으로 보여줄 문구입니다.
    displayedPartyTitle: string;
    // 현재 적용 중인 출발지 입력 방식입니다.
    departureInputMethod: DepartureInputMethod;
    // 현재 선택 상태 묶음입니다.
    selection: ChatDeparturePartyCardSelectionProps;
    // 저장 출발지 목록 상태 묶음입니다.
    savedList: ChatDeparturePartyCardSavedListProps;
    // 카드 내부에서 호출할 액션 묶음입니다.
    actions: ChatDeparturePartyCardActions;
};

export function ChatDeparturePartyCard({
    party,
    partyLabel,
    departurePartyLabel,
    displayedPartyTitle,
    departureInputMethod,
    selection,
    savedList,
    actions,
}: ChatDeparturePartyCardProps) {
    return (
        <div
            className={mergeClassNames(
                "rounded-2xl border px-3.5 py-3.5 shadow-[0px_12px_28px_rgba(52,41,104,0.08)] sm:px-4 sm:py-4",
                party === "me"
                    ? "border-[#cfe0ff] bg-[linear-gradient(180deg,rgba(237,245,255,0.96)_0%,rgba(219,234,254,0.88)_100%)]"
                    : "border-[#ffd3dd] bg-[linear-gradient(180deg,rgba(255,241,244,0.96)_0%,rgba(255,228,234,0.9)_100%)]",
            )}
        >
            <div className="flex items-center justify-between gap-3">
                <p className={`${friendsHeadingFont.className} text-[14px] text-[#111827] sm:text-[16px]`}>
                    {displayedPartyTitle}
                </p>
                <span
                    className={mergeClassNames(
                        `${friendsBodyFont.className} rounded-full px-2.5 py-1 text-[10px] sm:text-[11px]`,
                        party === "me"
                            ? "bg-[#dbeafe] text-[#1d4ed8]"
                            : "bg-[#ffe4ea] text-[#be185d]",
                    )}
                >
                    {selection.selectedDepartureLabel ?? "선택 필요"}
                </span>
            </div>

            {departureInputMethod === "search" ? (
                <label className="mt-4 block">
                    <span className={`${friendsBodyFont.className} text-[11px] text-[#6b7280] sm:text-[13px]`}>
                        {departurePartyLabel} 주소
                    </span>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                        <input
                            value={selection.departureSearchQuery}
                            readOnly
                            placeholder={party === "me" ? "예: 건대입구역 2번 출구" : `예: ${selection.currentChatFriendLabel} 출발역 1번 출구`}
                            className={`${friendsBodyFont.className} h-11 flex-1 rounded-[14px] border border-white/65 bg-[#f9f8ff] px-3.5 text-[13px] text-[#111827] outline-none sm:h-12 sm:px-4 sm:text-[14px]`}
                        />
                        <ChatActionButton
                            variant="outline"
                            onClick={() => actions.onOpenDaumAddressSearch(party)}
                            disabled={selection.isPostcodeLayerOpen}
                            className={`${friendsHeadingFont.className} min-h-11 rounded-xl px-3.5 py-2 text-[13px] font-bold sm:min-h-12 sm:min-w-33 sm:px-4 sm:text-[14px]`}
                        >
                            {selection.isPostcodeLayerOpen ? "주소 검색 표시 중" : "주소 검색"}
                        </ChatActionButton>
                    </div>
                    <ChatActionButton
                        variant="outline"
                        onClick={() => actions.onOpenSaveLocationLayer(
                            party,
                            selection.departureSearchQuery,
                            "주소 검색 기준",
                            undefined,
                            "preset",
                            party === "friend" ? selection.selectedFriendId : undefined,
                            party === "friend" ? selection.selectedFriendName : undefined,
                        )}
                        disabled={!selection.departureSearchQuery.trim()}
                        className={`${friendsHeadingFont.className} mt-2.5 min-h-10 w-full rounded-xl px-3.5 py-2 text-[13px] font-bold sm:mt-3 sm:min-h-11 sm:w-auto sm:px-4 sm:text-[14px]`}
                    >
                        {party === "me" ? "내 위치 저장" : `${selection.selectedFriendName} 위치 저장`}
                    </ChatActionButton>
                </label>
            ) : null}

            {departureInputMethod === "pin" ? (
                <div className="mt-4">
                    <p className={`${friendsBodyFont.className} text-[11px] text-[#6b7280] sm:text-[13px]`}>
                        지도 핀 선택 상태
                    </p>
                    <p className={`${friendsDisplayFont.className} mt-1.5 text-[13px] text-[#111827] sm:mt-2 sm:text-[15px]`}>
                        {selection.selectedDepartureLabel ?? "아직 선택한 핀 위치가 없어요."}
                    </p>
                    <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:items-center sm:gap-3">
                        <ChatActionButton
                            variant="outline"
                            onClick={() => actions.onOpenPinPicker(party)}
                            className={`${friendsHeadingFont.className} min-h-10 w-full rounded-xl px-3.5 py-2 text-[14px] font-bold sm:min-h-11 sm:w-auto sm:px-4 sm:text-[15px]`}
                        >
                            {departurePartyLabel} 핀 찍기
                        </ChatActionButton>
                        <ChatActionButton
                            variant="outline"
                            onClick={() => actions.onOpenSaveLocationLayer(
                                party,
                                selection.selectedDepartureLabel ?? "",
                                "지도 핀 기준",
                                undefined,
                                "preset",
                                party === "friend" ? selection.selectedFriendId : undefined,
                                party === "friend" ? selection.selectedFriendName : undefined,
                            )}
                            disabled={!selection.selectedDepartureLabel}
                            className={`${friendsHeadingFont.className} min-h-10 w-full rounded-xl px-3.5 py-2 text-[14px] font-bold sm:min-h-11 sm:w-auto sm:px-4 sm:text-[15px]`}
                        >
                            {party === "me" ? "내 위치 저장" : `${selection.selectedFriendName} 위치 저장`}
                        </ChatActionButton>
                    </div>
                </div>
            ) : null}

            {departureInputMethod === "saved" ? (
                <ChatSavedDepartureListSection
                    party={party}
                    departurePartyLabel={partyLabel}
                    selectedDepartureFriendId={savedList.selectedDepartureFriendId}
                    departureFriendOptions={savedList.departureFriendOptions}
                    visibleSavedDepartures={savedList.visibleSavedDepartures}
                    selectedSavedDepartureId={savedList.selectedSavedDepartureId}
                    savedDepartureResolvedAddresses={savedList.savedDepartureResolvedAddresses}
                    savedDepartureFilterQuery={savedList.savedDepartureFilterQuery}
                    visibleCount={savedList.savedDepartureVisibleCount}
                    formatSavedDepartureDisplayTime={savedList.formatSavedDepartureDisplayTime}
                    onDepartureFriendSelect={actions.onDepartureFriendSelect}
                    onSavedDepartureFilterQueryChange={actions.onSavedDepartureFilterQueryChange}
                    onDeleteAllSavedDeparturesClick={actions.onDeleteAllSavedDeparturesClick}
                    onSavedDepartureSelectionClick={actions.onSavedDepartureSelectionClick}
                    onOpenSavedDepartureMapLayer={actions.onOpenSavedDepartureMapLayer}
                    onOpenSavedDepartureEditLayer={actions.onOpenSavedDepartureEditLayer}
                    onDeleteSavedDepartureClick={actions.onDeleteSavedDepartureClick}
                    onShowMoreSavedDepartures={actions.onShowMoreSavedDepartures}
                />
            ) : null}
        </div>
    );
}