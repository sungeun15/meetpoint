import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { loadDaumPostcodeApi } from "@/lib/daum/postcode-loader";
import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../friends/fonts";
import { ChatActionButton, ChatSectionCard } from "./chat-ui";
import { mergeClassNames } from "./class-names";
import { ChatModalShell } from "./chat-modal-shell";
import { ChatPinPickerLayer } from "./chat-pin-picker-layer";
import type {
    DepartureInputMethod,
    DepartureParty,
    MeetingMode,
    RecommendationCategory,
    SavedDeparture,
} from "./types";

const modeOptions: Array<{ id: MeetingMode; label: string; description: string }> = [
    { id: "now", label: "지금 만나기", description: "현재 공유 위치 기준으로 바로 추천을 받아요." },
    { id: "later", label: "나중에 만나기", description: "약속 출발 위치를 정한 뒤 추천을 받아요." },
];

const departureMethodOptions: Array<{ id: DepartureInputMethod; label: string }> = [
    { id: "search", label: "주소 검색" },
    { id: "pin", label: "지도 핀 지정" },
    { id: "saved", label: "저장 위치" },
];

const categoryOptions: Array<{ id: RecommendationCategory; label: string; description: string }> = [
    { id: "cafe", label: "카페", description: "대화 중심 약속" },
    { id: "meal", label: "식사", description: "식사 약속" },
    { id: "fun", label: "놀거리", description: "활동 중심 약속" },
];

const departurePartyMeta: Array<{ id: DepartureParty; label: string }> = [
    { id: "me", label: "내 출발 위치" },
    { id: "friend", label: "친구 출발 위치" },
];

type ChatDepartureSettingsPanelProps = {
    meetingMode: MeetingMode;
    selectedCategory: RecommendationCategory;
    departureInputMethod: DepartureInputMethod;
    departureSearchQueries: Record<DepartureParty, string>;
    visibleSavedDepartures: SavedDeparture[];
    isSavedDepartureEmptyPreview: boolean;
    selectedSavedDepartureIds: Record<DepartureParty, string>;
    selectedDepartureLabels: Record<DepartureParty, string | null> | null;
    selectedFriendName: string;
    canRecommend: boolean;
    onMeetingModeChange: (nextMode: MeetingMode) => void;
    onCategoryChange: (nextCategory: RecommendationCategory) => void;
    onDepartureInputMethodChange: (nextMethod: DepartureInputMethod) => void;
    onDepartureSearchQueryChange: (party: DepartureParty, nextQuery: string) => void;
    onOpenSaveLocationLayer: (party: DepartureParty, previewValue: string, sourceLabel: string) => void;
    onPinnedDepartureSelect: (party: DepartureParty, pinnedAddress: string) => void;
    onSavedDepartureSelect: (party: DepartureParty, departureId: string) => void;
    onSavedDepartureEmptyPreviewToggle: () => void;
    onRecommend: () => void;
};

export function ChatDepartureSettingsPanel({
    meetingMode,
    selectedCategory,
    departureInputMethod,
    departureSearchQueries,
    visibleSavedDepartures,
    isSavedDepartureEmptyPreview,
    selectedSavedDepartureIds,
    selectedDepartureLabels,
    selectedFriendName,
    canRecommend,
    onMeetingModeChange,
    onCategoryChange,
    onDepartureInputMethodChange,
    onDepartureSearchQueryChange,
    onOpenSaveLocationLayer,
    onPinnedDepartureSelect,
    onSavedDepartureSelect,
    onSavedDepartureEmptyPreviewToggle,
    onRecommend,
}: ChatDepartureSettingsPanelProps) {
    const postcodeContainerRef = useRef<HTMLDivElement | null>(null);
    const [openingPostcodeParty, setOpeningPostcodeParty] = useState<DepartureParty | null>(null);
    const [openingPinPickerParty, setOpeningPinPickerParty] = useState<DepartureParty | null>(null);
    const [postcodeInitialQuery, setPostcodeInitialQuery] = useState("");
    const [postcodeFeedbackMessage, setPostcodeFeedbackMessage] = useState<string | null>(null);
    const departurePartyLabels = {
        me: "내",
        friend: selectedFriendName,
    } satisfies Record<DepartureParty, string>;

    useEffect(() => {
        if (!openingPostcodeParty || !postcodeContainerRef.current) {
            return;
        }

        let isDisposed = false;
        const container = postcodeContainerRef.current;
        container.innerHTML = "";

        loadDaumPostcodeApi()
            .then((daum) => {
                if (isDisposed || !postcodeContainerRef.current) {
                    return;
                }

                new daum.Postcode({
                    animation: true,
                    hideEngBtn: true,
                    popupTitle: `${departurePartyLabels[openingPostcodeParty]} 출발 위치 찾기`,
                    width: "100%",
                    height: "100%",
                    oncomplete: async (data) => {
                        try {
                            const selectedAddress = data.userSelectedType === "J"
                                ? data.jibunAddress || data.address || data.roadAddress
                                : data.roadAddress || data.address || data.jibunAddress;

                            if (!selectedAddress) {
                                throw new Error("주소를 확인하지 못했어요. 다시 선택해 주세요.");
                            }

                            if (isDisposed) {
                                return;
                            }

                            onDepartureSearchQueryChange(openingPostcodeParty, selectedAddress);
                            setPostcodeFeedbackMessage(`${departurePartyLabels[openingPostcodeParty]} 출발 위치 주소를 입력란에 반영했어요.`);
                            setOpeningPostcodeParty(null);
                        } catch (error) {
                            setPostcodeFeedbackMessage(error instanceof Error ? error.message : "주소를 반영하지 못했어요.");
                        }
                    },
                    onclose: () => {
                        if (!isDisposed) {
                            setOpeningPostcodeParty(null);
                        }
                    },
                }).embed(postcodeContainerRef.current, {
                    autoClose: true,
                    q: postcodeInitialQuery || undefined,
                });
            })
            .catch((error) => {
                if (!isDisposed) {
                    setOpeningPostcodeParty(null);
                    setPostcodeFeedbackMessage(error instanceof Error ? error.message : "다음 주소 검색기를 열지 못했어요.");
                }
            });

        return () => {
            isDisposed = true;
            container.innerHTML = "";
        };
    }, [departurePartyLabels, onDepartureSearchQueryChange, openingPostcodeParty, postcodeInitialQuery]);

    function handleOpenDaumAddressSearch(party: DepartureParty) {
        setPostcodeInitialQuery(departureSearchQueries[party].trim());
        setOpeningPostcodeParty(party);
        setPostcodeFeedbackMessage(null);
    }

    function handleOpenPinPicker(party: DepartureParty) {
        setOpeningPinPickerParty(party);
    }

    function handleConfirmPinnedAddress(address: string) {
        if (!openingPinPickerParty) {
            return;
        }

        onPinnedDepartureSelect(openingPinPickerParty, address);
        setOpeningPinPickerParty(null);
    }

    return (
        <ChatSectionCard tone="accent" className="relative overflow-hidden px-4 py-5 sm:px-6 sm:py-6 lg:px-6 xl:px-7">
            <Image
                alt="Background pattern"
                src="/imports/Frame3/background-pattern.svg"
                width={420}
                height={220}
                className="absolute bottom-0 right-0 h-auto w-45 opacity-20 sm:w-60 lg:w-85"
            />

            <div className="relative z-10 space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-md space-y-3">
                        <h3 className={`${friendsHeadingFont.className} text-[22px] font-bold text-[#111827] sm:text-[26px] lg:text-[28px]`}>
                            추천 조건 정하기
                        </h3>
                        <p className={`${friendsDisplayFont.className} break-keep text-[13px] leading-[1.6] text-[#6b7280] sm:text-[15px] lg:text-[16px]`}>
                            만남 모드, 출발 위치, 카테고리를 고른 뒤 추천 버튼을 누르면 결과 카드와 지도가 바로 바뀝니다.
                        </p>
                    </div>

                    <ChatActionButton
                        variant="accent"
                        onClick={onRecommend}
                        disabled={!canRecommend}
                        className={`${friendsHeadingFont.className} min-h-13 w-full rounded-2xl px-6 py-3 text-[17px] font-bold leading-none disabled:cursor-not-allowed disabled:opacity-55 sm:min-h-14 sm:w-auto sm:px-7 sm:py-3.5 sm:text-[18px]`}
                    >
                        추천 받기
                    </ChatActionButton>
                </div>

                <div className="grid gap-3">
                    <div className="rounded-[18px] bg-white/72 px-4 py-4 shadow-[0px_12px_24px_rgba(52,41,104,0.08)]">
                        <p className={`${friendsDisplayFont.className} text-[14px] text-[#111827] sm:text-[16px]`}>
                            만남 모드
                        </p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {modeOptions.map((option) => {
                                const isSelected = meetingMode === option.id;

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => onMeetingModeChange(option.id)}
                                        className={mergeClassNames(
                                            "rounded-2xl border px-4 py-3 text-left transition-colors",
                                            isSelected
                                                ? "border-[#6c5ce7] bg-[#f5f1ff] shadow-[0px_10px_22px_rgba(108,92,231,0.12)]"
                                                : "border-white/60 bg-white/80 hover:bg-white",
                                        )}
                                    >
                                        <p className={`${friendsHeadingFont.className} text-[16px] text-[#111827] sm:text-[17px]`}>
                                            {option.label}
                                        </p>
                                        <p className={`${friendsBodyFont.className} mt-1 text-[12px] leading-[1.55] text-[#6b7280] sm:text-[13px]`}>
                                            {option.description}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {meetingMode === "later" ? (
                        <div className="rounded-[18px] bg-white/72 px-4 py-4 shadow-[0px_12px_24px_rgba(52,41,104,0.08)]">
                            <p className={`${friendsDisplayFont.className} text-[14px] text-[#111827] sm:text-[16px]`}>
                                출발 위치
                            </p>
                            <p className={`${friendsBodyFont.className} mt-2 break-keep text-[12px] leading-[1.6] text-[#6b7280] sm:text-[13px]`}>
                                나중에 만나기에서는 내 출발 위치와 친구 출발 위치를 각각 정해야 추천 기준이 완성돼요.
                            </p>

                            {departureInputMethod === "search" && postcodeFeedbackMessage ? (
                                <div className="mt-3 rounded-[14px] border border-[#d9d4ff] bg-white/70 px-4 py-3">
                                    <p className={`${friendsBodyFont.className} text-[12px] leading-[1.55] text-[#5b43d6] sm:text-[13px]`}>
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
                                                `${friendsBodyFont.className} rounded-full border px-3 py-1.5 text-[12px] transition-colors sm:text-[13px]`,
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

                            {departureInputMethod === "saved" ? (
                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    <span className={`${friendsBodyFont.className} text-[12px] text-[#6b7280] sm:text-[13px]`}>
                                        저장 위치 상태 미리보기
                                    </span>
                                    <button
                                        type="button"
                                        onClick={onSavedDepartureEmptyPreviewToggle}
                                        className={mergeClassNames(
                                            `${friendsBodyFont.className} rounded-full border px-3 py-1.5 text-[12px] transition-colors sm:text-[13px]`,
                                            isSavedDepartureEmptyPreview
                                                ? "border-[#6c5ce7] bg-[#f5f1ff] text-[#5b43d6]"
                                                : "border-white/60 bg-white/80 text-[#6b7280] hover:bg-white",
                                        )}
                                    >
                                        {isSavedDepartureEmptyPreview ? "저장 위치 없음 보기" : "저장 위치 있음 보기"}
                                    </button>
                                </div>
                            ) : null}

                            <div className="mt-4 grid gap-3 lg:grid-cols-2">
                                {departurePartyMeta.map((party) => (
                                    <div
                                        key={party.id}
                                        className={mergeClassNames(
                                            "rounded-2xl border px-4 py-4 shadow-[0px_12px_28px_rgba(52,41,104,0.08)]",
                                            party.id === "me"
                                                ? "border-[#cfe0ff] bg-[linear-gradient(180deg,rgba(237,245,255,0.96)_0%,rgba(219,234,254,0.88)_100%)]"
                                                : "border-[#ffd3dd] bg-[linear-gradient(180deg,rgba(255,241,244,0.96)_0%,rgba(255,228,234,0.9)_100%)]",
                                        )}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <p className={`${friendsHeadingFont.className} text-[15px] text-[#111827] sm:text-[16px]`}>
                                                {party.id === "me" ? party.label : `${selectedFriendName} 출발 위치`}
                                            </p>
                                            <span
                                                className={mergeClassNames(
                                                    `${friendsBodyFont.className} rounded-full px-2.5 py-1 text-[11px]`,
                                                    party.id === "me"
                                                        ? "bg-[#dbeafe] text-[#1d4ed8]"
                                                        : "bg-[#ffe4ea] text-[#be185d]",
                                                )}
                                            >
                                                {selectedDepartureLabels?.[party.id] ?? "선택 필요"}
                                            </span>
                                        </div>

                                        {departureInputMethod === "search" ? (
                                            <label className="mt-4 block">
                                                <span className={`${friendsBodyFont.className} text-[12px] text-[#6b7280] sm:text-[13px]`}>
                                                    {departurePartyLabels[party.id]} 주소
                                                </span>
                                                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                                                    <input
                                                        value={departureSearchQueries[party.id]}
                                                        readOnly
                                                        placeholder={party.id === "me" ? "예: 건대입구역 2번 출구" : `예: ${selectedFriendName} 출발역 1번 출구`}
                                                        className={`${friendsBodyFont.className} h-12 flex-1 rounded-[14px] border border-white/65 bg-[#f9f8ff] px-4 text-[14px] text-[#111827] outline-none`}
                                                    />
                                                    <ChatActionButton
                                                        variant="outline"
                                                        onClick={() => handleOpenDaumAddressSearch(party.id)}
                                                        disabled={openingPostcodeParty !== null}
                                                        className={`${friendsHeadingFont.className} min-h-12 rounded-xl px-4 py-2 text-[14px] font-bold sm:min-w-33`}
                                                    >
                                                        {openingPostcodeParty === party.id ? "주소 검색 표시 중" : "다음 주소 검색"}
                                                    </ChatActionButton>
                                                </div>
                                                <ChatActionButton
                                                    variant="outline"
                                                    onClick={() => onOpenSaveLocationLayer(party.id, departureSearchQueries[party.id], "주소 검색 기준")}
                                                    disabled={!departureSearchQueries[party.id].trim()}
                                                    className={`${friendsHeadingFont.className} mt-3 min-h-11 w-full rounded-xl px-4 py-2 text-[14px] font-bold sm:w-auto`}
                                                >
                                                    {party.id === "me" ? "내 위치 저장" : "친구 위치 저장"}
                                                </ChatActionButton>
                                            </label>
                                        ) : null}

                                        {departureInputMethod === "pin" ? (
                                            <div className="mt-4">
                                                <p className={`${friendsBodyFont.className} text-[12px] text-[#6b7280] sm:text-[13px]`}>
                                                    지도 핀 선택 상태
                                                </p>
                                                <p className={`${friendsDisplayFont.className} mt-2 text-[14px] text-[#111827] sm:text-[15px]`}>
                                                    {selectedDepartureLabels?.[party.id] ?? "아직 선택한 핀 위치가 없어요."}
                                                </p>
                                                <ChatActionButton
                                                    variant="outline"
                                                    onClick={() => handleOpenPinPicker(party.id)}
                                                    className={`${friendsHeadingFont.className} mt-4 min-h-11 w-full rounded-xl px-4 py-2 text-[15px] font-bold sm:w-auto`}
                                                >
                                                    {departurePartyLabels[party.id]} 핀 찍기
                                                </ChatActionButton>
                                                <ChatActionButton
                                                    variant="outline"
                                                    onClick={() => onOpenSaveLocationLayer(party.id, selectedDepartureLabels?.[party.id] ?? "", "지도 핀 기준")}
                                                    disabled={!selectedDepartureLabels?.[party.id]}
                                                    className={`${friendsHeadingFont.className} mt-2 min-h-11 w-full rounded-xl px-4 py-2 text-[15px] font-bold sm:w-auto`}
                                                >
                                                    {party.id === "me" ? "내 위치 저장" : "친구 위치 저장"}
                                                </ChatActionButton>
                                            </div>
                                        ) : null}

                                        {departureInputMethod === "saved" ? (
                                            <div className="mt-4 grid gap-2">
                                                {visibleSavedDepartures.length > 0 ? visibleSavedDepartures.map((departure) => {
                                                    const isSelected = selectedSavedDepartureIds[party.id] === departure.id;

                                                    return (
                                                        <button
                                                            key={`${party.id}-${departure.id}`}
                                                            type="button"
                                                            onClick={() => onSavedDepartureSelect(party.id, departure.id)}
                                                            className={mergeClassNames(
                                                                "rounded-2xl border px-4 py-3 text-left transition-colors",
                                                                isSelected
                                                                    ? "border-[#6c5ce7] bg-[#f5f1ff]"
                                                                    : "border-white/60 bg-white/82 hover:bg-white",
                                                            )}
                                                        >
                                                            <p className={`${friendsHeadingFont.className} text-[15px] text-[#111827] sm:text-[16px]`}>
                                                                {departure.label}
                                                            </p>
                                                            <p className={`${friendsBodyFont.className} mt-1 text-[12px] leading-[1.55] text-[#6b7280] sm:text-[13px]`}>
                                                                {departure.description}
                                                            </p>
                                                        </button>
                                                    );
                                                }) : (
                                                    <div className="rounded-2xl border border-dashed border-[#d9d4ff] bg-[#faf8ff] px-4 py-4">
                                                        <p className={`${friendsHeadingFont.className} text-[16px] text-[#111827]`}>
                                                            저장된 출발 위치가 없어요.
                                                        </p>
                                                        <p className={`${friendsBodyFont.className} mt-2 text-[12px] leading-[1.55] text-[#6b7280] sm:text-[13px]`}>
                                                            로그인 사용자가 아직 즐겨찾기나 최근 출발 위치를 저장하지 않은 상태 UI입니다.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    <div className="rounded-[18px] bg-white/72 px-4 py-4 shadow-[0px_12px_24px_rgba(52,41,104,0.08)]">
                        <p className={`${friendsDisplayFont.className} text-[14px] text-[#111827] sm:text-[16px]`}>
                            카테고리
                        </p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                            {categoryOptions.map((option) => {
                                const isSelected = selectedCategory === option.id;

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => onCategoryChange(option.id)}
                                        className={mergeClassNames(
                                            "rounded-2xl border px-4 py-3 text-left transition-colors",
                                            isSelected
                                                ? "border-[#6c5ce7] bg-[#f5f1ff] shadow-[0px_10px_22px_rgba(108,92,231,0.12)]"
                                                : "border-white/60 bg-white/80 hover:bg-white",
                                        )}
                                    >
                                        <p className={`${friendsHeadingFont.className} text-[15px] text-[#111827] sm:text-[16px]`}>
                                            {option.label}
                                        </p>
                                        <p className={`${friendsBodyFont.className} mt-1 text-[12px] leading-[1.55] text-[#6b7280] sm:text-[13px]`}>
                                            {option.description}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {openingPostcodeParty ? (
                <ChatModalShell
                    title={`${departurePartyLabels[openingPostcodeParty]} 출발 위치 검색`}
                    description="선택한 주소를 해당 주소 칸에 바로 채워 넣어요."
                    onClose={() => setOpeningPostcodeParty(null)}
                    panelClassName="max-w-180"
                    contentClassName="px-3 py-3 sm:px-5 sm:py-5"
                    notice={(
                        <p className={`${friendsBodyFont.className} text-[12px] leading-[1.55] text-[#5f6782] sm:text-[13px]`}>
                            팝업 대신 화면 안 레이어를 쓰기 때문에 모바일과 웹뷰 환경에서도 더 안전하게 동작합니다.
                        </p>
                    )}
                >
                    <div
                        ref={postcodeContainerRef}
                        className="h-[70vh] min-h-105 w-full overflow-hidden rounded-[18px] border border-[#ece9ff] bg-white sm:max-h-180"
                    />
                </ChatModalShell>
            ) : null}

            {openingPinPickerParty ? (
                <ChatPinPickerLayer
                    party={openingPinPickerParty}
                    partyLabel={departurePartyLabels[openingPinPickerParty]}
                    onClose={() => setOpeningPinPickerParty(null)}
                    onConfirm={handleConfirmPinnedAddress}
                />
            ) : null}
        </ChatSectionCard>
    );
}