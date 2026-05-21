import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../../friends/fonts";
import { mergeClassNames } from "../class-names";
import type { DepartureParty, SavedDeparture } from "../types";

type SavedDepartureResolvedAddressState = Record<string, {
    // 저장된 출발지 위도입니다.
    latitude: number;
    // 저장된 출발지 경도입니다.
    longitude: number;
    // 저장된 출발지 주소 문자열입니다.
    address: string;
}>;

type ChatSavedDepartureListSectionProps = {
    // 내 목록인지 친구 목록인지 나타냅니다.
    party: DepartureParty;
    // 검색 input 접근성 문구에 쓸 출발지 라벨입니다.
    departurePartyLabel: string;
    // 친구 저장 출발지 필터에서 선택된 친구 ID입니다.
    selectedDepartureFriendId: string;
    // 친구 저장 출발지 필터 옵션입니다.
    departureFriendOptions: Array<{ id: string; nickname: string }>;
    // 현재 화면에서 다룰 저장 출발지 원본 목록입니다.
    visibleSavedDepartures: SavedDeparture[];
    // 현재 선택된 저장 출발지 ID입니다.
    selectedSavedDepartureId: string;
    // 저장 출발지별 주소 해석 결과입니다.
    savedDepartureResolvedAddresses: SavedDepartureResolvedAddressState;
    // 저장 출발지 검색어입니다.
    savedDepartureFilterQuery: string;
    // 현재 우선 노출할 저장 출발지 개수입니다.
    visibleCount: number;
    // 표시용 시각 문자열을 만드는 함수입니다.
    formatSavedDepartureDisplayTime: (departure: SavedDeparture) => string;
    // 친구 저장 출발지 필터를 바꿉니다.
    onDepartureFriendSelect: (nextFriendId: string) => void;
    // 저장 출발지 검색어를 바꿉니다.
    onSavedDepartureFilterQueryChange: (nextQuery: string) => void;
    // 현재 파티의 저장 출발지를 전체 삭제합니다.
    onDeleteAllSavedDeparturesClick: () => void;
    // 저장 출발지를 현재 출발지로 선택합니다.
    onSavedDepartureSelectionClick: (departure: SavedDeparture) => void;
    // 저장 출발지 지도 미리보기를 엽니다.
    onOpenSavedDepartureMapLayer: (departure: SavedDeparture) => void;
    // 저장 출발지 수정 레이어를 엽니다.
    onOpenSavedDepartureEditLayer: (departure: SavedDeparture) => void;
    // 저장 출발지 하나를 삭제합니다.
    onDeleteSavedDepartureClick: (departureId: string, departureLabel: string) => void;
    // 저장 출발지 목록을 더 보여줍니다.
    onShowMoreSavedDepartures: () => void;
};

function formatSavedDepartureCoordinateLabel(departure: SavedDeparture) {
    return `위도 ${departure.latitude.toFixed(5)} · 경도 ${departure.longitude.toFixed(5)}`;
}

export function ChatSavedDepartureListSection({
    party,
    departurePartyLabel,
    selectedDepartureFriendId,
    departureFriendOptions,
    visibleSavedDepartures,
    selectedSavedDepartureId,
    savedDepartureResolvedAddresses,
    savedDepartureFilterQuery,
    visibleCount,
    formatSavedDepartureDisplayTime,
    onDepartureFriendSelect,
    onSavedDepartureFilterQueryChange,
    onDeleteAllSavedDeparturesClick,
    onSavedDepartureSelectionClick,
    onOpenSavedDepartureMapLayer,
    onOpenSavedDepartureEditLayer,
    onDeleteSavedDepartureClick,
    onShowMoreSavedDepartures,
}: ChatSavedDepartureListSectionProps) {
    const normalizedFilterQuery = savedDepartureFilterQuery.trim().toLowerCase();
    const filteredSavedDepartures = normalizedFilterQuery
        ? visibleSavedDepartures.filter((departure) => {
            const searchTarget = `${departure.label} ${departure.address} ${departure.description}`.toLowerCase();
            return searchTarget.includes(normalizedFilterQuery);
        })
        : visibleSavedDepartures;
    const pagedSavedDepartures = filteredSavedDepartures.slice(0, visibleCount);
    const hasMoreSavedDepartures = filteredSavedDepartures.length > visibleCount;
    const displayedSavedDepartureCount = Math.min(visibleCount, filteredSavedDepartures.length);
    const savedDepartureSummaryLabel = `${displayedSavedDepartureCount} /${filteredSavedDepartures.length}건`;
    const hasAnySavedDepartures = visibleSavedDepartures.length > 0;

    return (
        <div className="mt-4 grid gap-2">
            <div className={mergeClassNames(
                "grid h-96 gap-2",
                hasMoreSavedDepartures
                    ? "grid-rows-[auto_minmax(0,1fr)_auto]"
                    : "grid-rows-[auto_minmax(0,1fr)]",
            )}>
                <div className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-3.5 py-2 sm:px-4">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                        <p className={`${friendsHeadingFont.className} shrink-0 rounded-full bg-[#2f2a4a] px-2.5 py-1 text-[11px] text-white sm:px-3 sm:text-[12px]`}>
                            {savedDepartureSummaryLabel}
                        </p>
                        {party === "friend" ? (
                            <label className="shrink-0">
                                <span className="sr-only">친구 선택</span>
                                <select
                                    value={selectedDepartureFriendId}
                                    onChange={(event) => onDepartureFriendSelect(event.target.value)}
                                    className={`${friendsBodyFont.className} h-9 rounded-full border border-white/70 bg-[#f9f8ff] px-3 text-[12px] text-[#111827] outline-none sm:h-10 sm:px-3.5 sm:text-[13px]`}
                                >
                                    {departureFriendOptions.map((friendOption) => (
                                        <option key={friendOption.id} value={friendOption.id}>
                                            {friendOption.nickname}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        ) : null}
                        <label className="min-w-0 flex-1">
                            <span className="sr-only">{departurePartyLabel} 저장 위치 검색</span>
                            <input
                                value={savedDepartureFilterQuery}
                                onChange={(event) => onSavedDepartureFilterQueryChange(event.target.value)}
                                placeholder="검색"
                                className={`${friendsBodyFont.className} h-9 w-full rounded-full border border-white/70 bg-[#f9f8ff] px-3 text-[12px] text-[#111827] outline-none sm:h-10 sm:px-3.5 sm:text-[13px]`}
                            />
                        </label>
                    </div>
                    <button
                        type="button"
                        onClick={onDeleteAllSavedDeparturesClick}
                        disabled={!hasAnySavedDepartures}
                        className={`${friendsHeadingFont.className} shrink-0 rounded-full border border-[#fecdd3] bg-[#fff1f2] px-3 py-1.5 text-[11px] text-[#be123c] transition-colors hover:bg-[#ffe4e6] disabled:cursor-not-allowed disabled:opacity-45 sm:text-[12px]`}
                    >
                        전체 삭제
                    </button>
                </div>

                <div className="flex min-h-0 flex-col gap-2 overflow-y-auto pr-1">
                    {!hasAnySavedDepartures ? (
                        <div className="rounded-2xl border border-dashed border-[#d9d4ff] bg-[#faf8ff] px-3.5 py-3.5 sm:px-4 sm:py-4">
                            <p className={`${friendsHeadingFont.className} text-[15px] text-[#111827] sm:text-[16px]`}>
                                저장된 출발 위치가 없어요.
                            </p>
                            <p className={`${friendsBodyFont.className} mt-1.5 text-[11px] leading-[1.55] text-[#6b7280] sm:mt-2 sm:text-[13px]`}>
                                사용자가 아직 즐겨찾기나 최근 출발 위치를 저장하지 않은 상태 UI입니다.
                            </p>
                        </div>
                    ) : pagedSavedDepartures.length > 0 ? pagedSavedDepartures.map((departure) => {
                        const isSelected = selectedSavedDepartureId === departure.id;
                        const savedDepartureAddressLabel = (
                            savedDepartureResolvedAddresses[departure.id]?.address
                            ?? departure.address
                        ) || formatSavedDepartureCoordinateLabel(departure);
                        const savedDepartureTimeLabel = formatSavedDepartureDisplayTime(departure);
                        const departureTitle = party === "friend"
                            && departure.friendNickname
                            && departure.label.startsWith(departure.friendNickname)
                            ? departure.label
                                .slice(departure.friendNickname.length)
                                .replace(/^\s*[-:·]\s*/u, "")
                                .trim()
                            : departure.label;

                        return (
                            <div
                                key={`${party}-${departure.id}`}
                                className="flex h-15 items-stretch gap-1.5"
                            >
                                <button
                                    type="button"
                                    onClick={() => onSavedDepartureSelectionClick(departure)}
                                    className={mergeClassNames(
                                        "min-w-0 flex-1 overflow-hidden rounded-2xl border px-3.5 py-2 text-left transition-colors sm:px-4",
                                        isSelected
                                            ? "border-[#6c5ce7] bg-[#f5f1ff]"
                                            : "border-white/60 bg-white/82 hover:bg-white",
                                    )}
                                >
                                    <div className="flex h-full min-w-0 flex-col justify-center">
                                        {party === "friend" && departure.friendNickname ? (
                                            <div className="flex min-w-0 items-center gap-1.5">
                                                <span className={`${friendsDisplayFont.className} shrink-0 rounded-full bg-[linear-gradient(180deg,#f3e8ff_0%,#ede9fe_100%)] px-2 py-0.5 text-[9px] font-semibold leading-none text-[#6d28d9] shadow-[0px_2px_6px_rgba(109,40,217,0.18)]`}>
                                                    {departure.friendNickname}
                                                </span>
                                                <p className={`${friendsHeadingFont.className} min-w-0 truncate text-[14px] text-[#111827] sm:text-[16px]`}>
                                                    {departureTitle || departure.label}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className={`${friendsHeadingFont.className} truncate text-[14px] text-[#111827] sm:text-[16px]`}>
                                                {departure.label}
                                            </p>
                                        )}
                                        <p className={`${friendsBodyFont.className} truncate text-[11px] leading-[1.45] text-[#6b7280] sm:text-[13px]`}>
                                            {`${savedDepartureAddressLabel} · ${savedDepartureTimeLabel}`}
                                        </p>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onOpenSavedDepartureMapLayer(departure)}
                                    aria-label={`${departure.label} 위치 확인`}
                                    title="위치 확인"
                                    className="flex h-12 w-12 shrink-0 self-center items-center justify-center rounded-xl border border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8] transition-colors hover:bg-[#dbeafe]"
                                >
                                    <span className="sr-only">위치 확인</span>
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 24 24"
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M3.75 6.75 9 4.5l6 2.25 5.25-2.25v12.75L15 19.5 9 17.25l-5.25 2.25V6.75Z" />
                                        <path d="M9 4.5v12.75" />
                                        <path d="M15 6.75V19.5" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onOpenSavedDepartureEditLayer(departure)}
                                    aria-label={`${departure.label} 수정`}
                                    title="수정"
                                    className="flex h-12 w-12 shrink-0 self-center items-center justify-center rounded-xl border border-[#fed7aa] bg-[#fff7ed] text-[#c2410c] transition-colors hover:bg-[#ffedd5]"
                                >
                                    <span className="sr-only">수정</span>
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 24 24"
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="m4 20 4.4-1 9.87-9.87a1.5 1.5 0 0 0 0-2.12l-1.28-1.28a1.5 1.5 0 0 0-2.12 0L5 15.6 4 20Z" />
                                        <path d="m13.5 7.5 3 3" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDeleteSavedDepartureClick(departure.id, departure.label)}
                                    aria-label={`${departure.label} 삭제`}
                                    title="삭제"
                                    className="flex h-12 w-12 shrink-0 self-center items-center justify-center rounded-xl border border-[#fecdd3] bg-[#fff1f2] text-[#be123c] transition-colors hover:bg-[#ffe4e6]"
                                >
                                    <span className="sr-only">삭제</span>
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 24 24"
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M3 6h18" />
                                        <path d="M8 6V4.8c0-.66.54-1.2 1.2-1.2h5.6c.66 0 1.2.54 1.2 1.2V6" />
                                        <path d="M6.8 6l.75 12.2c.04.68.61 1.2 1.29 1.2h6.32c.68 0 1.25-.52 1.29-1.2L17.2 6" />
                                        <path d="M10 10.2v5.6" />
                                        <path d="M14 10.2v5.6" />
                                    </svg>
                                </button>
                            </div>
                        );
                    }) : (
                        <div className="rounded-2xl border border-dashed border-[#d9d4ff] bg-[#faf8ff] px-3.5 py-3.5 sm:px-4 sm:py-4">
                            <p className={`${friendsHeadingFont.className} text-[15px] text-[#111827] sm:text-[16px]`}>
                                검색 결과가 없어요.
                            </p>
                            <p className={`${friendsBodyFont.className} mt-1.5 text-[11px] leading-[1.55] text-[#6b7280] sm:mt-2 sm:text-[13px]`}>
                                다른 이름이나 주소 키워드로 다시 찾아보세요.
                            </p>
                        </div>
                    )}
                </div>

                {hasMoreSavedDepartures ? (
                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={onShowMoreSavedDepartures}
                            className={`${friendsHeadingFont.className} rounded-full border border-[#d9d4ff] bg-white/82 px-4 py-2 text-[12px] text-[#5b43d6] transition-colors hover:bg-white sm:text-[13px]`}
                        >
                            더보기
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}