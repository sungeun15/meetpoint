import Image from "next/image";

import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../friends/fonts";
import { ChatActionButton, ChatSectionCard } from "./chat-ui";
import type {
    DepartureInputMethod,
    MeetingMode,
    RecommendationCard,
    RecommendationCategory,
    RecommendationSummary,
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

function mergeClassNames(...classNames: Array<string | false | null | undefined>) {
    return classNames.filter(Boolean).join(" ");
}

type ChatStatusPanelsProps = {
    myLocationStatus: string;
    friendLocationStatus: string;
    meetingMode: MeetingMode;
    selectedCategory: RecommendationCategory;
    departureInputMethod: DepartureInputMethod;
    departureSearchQuery: string;
    savedDepartures: SavedDeparture[];
    selectedSavedDepartureId: string;
    selectedDepartureLabel: string | null;
    recommendationSummary: RecommendationSummary;
    canRecommend: boolean;
    onShareLocation: () => void;
    onMeetingModeChange: (nextMode: MeetingMode) => void;
    onCategoryChange: (nextCategory: RecommendationCategory) => void;
    onDepartureInputMethodChange: (nextMethod: DepartureInputMethod) => void;
    onDepartureSearchQueryChange: (nextQuery: string) => void;
    onPinnedDepartureSelect: () => void;
    onSavedDepartureSelect: (departureId: string) => void;
    onRecommend: () => void;
    hasRecommendations: boolean;
    recommendationCards: RecommendationCard[];
};

export function ChatStatusPanels({
    myLocationStatus,
    friendLocationStatus,
    meetingMode,
    selectedCategory,
    departureInputMethod,
    departureSearchQuery,
    savedDepartures,
    selectedSavedDepartureId,
    selectedDepartureLabel,
    recommendationSummary,
    canRecommend,
    onShareLocation,
    onMeetingModeChange,
    onCategoryChange,
    onDepartureInputMethodChange,
    onDepartureSearchQueryChange,
    onPinnedDepartureSelect,
    onSavedDepartureSelect,
    onRecommend,
    hasRecommendations,
    recommendationCards,
}: ChatStatusPanelsProps) {
    return (
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:gap-6">
            <ChatSectionCard className="px-4 py-5 sm:px-6 sm:py-6 lg:px-6 xl:px-7">
                <div className="space-y-3">
                    <h3 className={`${friendsHeadingFont.className} text-[22px] font-bold text-[#111827] sm:text-[26px] lg:text-[28px]`}>
                        위치 상태
                    </h3>
                    <div className="rounded-[18px] bg-[#f8f5ff] px-4 py-4">
                        <p className={`${friendsDisplayFont.className} text-[14px] text-[#111827] sm:text-[16px] lg:text-[17px]`}>
                            내 위치 상태
                        </p>
                        <p className={`${friendsBodyFont.className} break-keep mt-2 text-[13px] leading-[1.65] text-[#6b7280] sm:text-[14px] lg:text-[15px]`}>
                            {myLocationStatus}
                        </p>
                    </div>
                    <div className="rounded-[18px] bg-[#f8f5ff] px-4 py-4">
                        <p className={`${friendsDisplayFont.className} text-[14px] text-[#111827] sm:text-[16px] lg:text-[17px]`}>
                            친구 위치 상태
                        </p>
                        <p className={`${friendsBodyFont.className} break-keep mt-2 text-[13px] leading-[1.65] text-[#6b7280] sm:text-[14px] lg:text-[15px]`}>
                            {friendLocationStatus}
                        </p>
                    </div>
                </div>

                <ChatActionButton
                    onClick={onShareLocation}
                    className={`${friendsHeadingFont.className} mt-5 min-h-[48px] w-full rounded-[12px] px-6 py-2.5 text-[17px] font-bold sm:min-h-[52px] sm:text-[18px]`}
                >
                    위치 공유하기
                </ChatActionButton>
            </ChatSectionCard>

            <ChatSectionCard tone="accent" className="relative overflow-hidden px-4 py-5 sm:px-6 sm:py-6 lg:px-6 xl:px-7">
                <Image
                    alt="Background pattern"
                    src="/imports/Frame3/background-pattern.svg"
                    width={420}
                    height={220}
                    className="absolute bottom-0 right-0 h-auto w-[180px] opacity-20 sm:w-[240px] lg:w-[340px]"
                />

                <div className="relative z-10 space-y-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-[28rem] space-y-3">
                            <h3 className={`${friendsHeadingFont.className} text-[22px] font-bold text-[#111827] sm:text-[26px] lg:text-[28px]`}>
                                추천 입력과 결과 보기
                            </h3>
                            <p className={`${friendsDisplayFont.className} break-keep text-[13px] leading-[1.6] text-[#6b7280] sm:text-[15px] lg:text-[16px]`}>
                                만남 모드와 카테고리를 정하고 추천을 시작하면 중심 기준과 장소 후보를 함께 비교할 수 있어요.
                            </p>
                        </div>

                        <ChatActionButton
                            variant="accent"
                            onClick={onRecommend}
                            disabled={!canRecommend}
                            className={`${friendsHeadingFont.className} min-h-[52px] w-full rounded-[16px] px-6 py-3 text-[17px] font-bold leading-none disabled:cursor-not-allowed disabled:opacity-55 sm:min-h-[56px] sm:w-auto sm:px-7 sm:py-3.5 sm:text-[18px]`}
                        >
                            {meetingMode === "now" ? "지금 만나기 추천 시작" : "나중에 만나기 추천 시작"}
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
                                                "rounded-[16px] border px-4 py-3 text-left transition-colors",
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
                                    나중에 만나기에서는 주소 검색, 지도 핀 지정, 저장 위치 중 하나를 선택해 추천 기준을 정해요.
                                </p>

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

                                {departureInputMethod === "search" ? (
                                    <label className="mt-4 block">
                                        <span className={`${friendsBodyFont.className} text-[12px] text-[#6b7280] sm:text-[13px]`}>
                                            주소 검색 입력
                                        </span>
                                        <input
                                            value={departureSearchQuery}
                                            onChange={(event) => onDepartureSearchQueryChange(event.target.value)}
                                            placeholder="예: 건대입구역 2번 출구"
                                            className={`${friendsBodyFont.className} mt-2 h-12 w-full rounded-[14px] border border-white/65 bg-white/92 px-4 text-[14px] text-[#111827] outline-none transition focus:border-[#6c5ce7]`}
                                        />
                                        <p className={`${friendsBodyFont.className} mt-2 text-[12px] leading-[1.55] text-[#6b7280]`}>
                                            주소 검색 API 연동 전까지는 입력한 문구를 출발 위치 기준 UI로 사용합니다.
                                        </p>
                                    </label>
                                ) : null}

                                {departureInputMethod === "pin" ? (
                                    <div className="mt-4 rounded-[16px] border border-white/60 bg-white/82 px-4 py-4">
                                        <p className={`${friendsBodyFont.className} text-[12px] text-[#6b7280] sm:text-[13px]`}>
                                            지도 핀 선택 상태
                                        </p>
                                        <p className={`${friendsDisplayFont.className} mt-2 text-[14px] text-[#111827] sm:text-[15px]`}>
                                            {selectedDepartureLabel ?? "아직 선택한 핀 위치가 없어요."}
                                        </p>
                                        <ChatActionButton
                                            variant="outline"
                                            onClick={onPinnedDepartureSelect}
                                            className={`${friendsHeadingFont.className} mt-4 min-h-[44px] w-full rounded-[12px] px-4 py-2 text-[15px] font-bold sm:w-auto`}
                                        >
                                            지도 핀 위치 사용하기
                                        </ChatActionButton>
                                    </div>
                                ) : null}

                                {departureInputMethod === "saved" ? (
                                    <div className="mt-4 grid gap-2">
                                        {savedDepartures.map((departure) => {
                                            const isSelected = selectedSavedDepartureId === departure.id;

                                            return (
                                                <button
                                                    key={departure.id}
                                                    type="button"
                                                    onClick={() => onSavedDepartureSelect(departure.id)}
                                                    className={mergeClassNames(
                                                        "rounded-[16px] border px-4 py-3 text-left transition-colors",
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
                                        })}
                                    </div>
                                ) : null}
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
                                                "rounded-[16px] border px-4 py-3 text-left transition-colors",
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

                    {hasRecommendations ? (
                        <div className="grid gap-3">
                            <article className="rounded-[18px] bg-white/92 px-4 py-4 shadow-[0px_12px_30px_rgba(52,41,104,0.1)]">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <h4 className={`${friendsHeadingFont.className} text-[18px] text-[#111827] sm:text-[20px]`}>
                                        추천 기준 요약
                                    </h4>
                                    <span className={`${friendsBodyFont.className} w-fit rounded-full bg-[#f3eeff] px-3 py-1 text-[11px] text-[#6c5ce7] sm:text-[12px]`}>
                                        {recommendationSummary.modeLabel}
                                    </span>
                                </div>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-[14px] bg-[#faf7ff] px-3 py-3">
                                        <p className={`${friendsBodyFont.className} text-[11px] uppercase tracking-[0.18em] text-[#8a7be5]`}>
                                            카테고리
                                        </p>
                                        <p className={`${friendsDisplayFont.className} mt-2 text-[14px] text-[#111827] sm:text-[15px]`}>
                                            {recommendationSummary.categoryLabel}
                                        </p>
                                    </div>
                                    <div className="rounded-[14px] bg-[#faf7ff] px-3 py-3">
                                        <p className={`${friendsBodyFont.className} text-[11px] uppercase tracking-[0.18em] text-[#8a7be5]`}>
                                            출발 기준
                                        </p>
                                        <p className={`${friendsDisplayFont.className} mt-2 text-[14px] text-[#111827] sm:text-[15px]`}>
                                            {recommendationSummary.departureLabel}
                                        </p>
                                    </div>
                                    <div className="rounded-[14px] bg-[#faf7ff] px-3 py-3">
                                        <p className={`${friendsBodyFont.className} text-[11px] uppercase tracking-[0.18em] text-[#8a7be5]`}>
                                            중심 기준
                                        </p>
                                        <p className={`${friendsDisplayFont.className} mt-2 text-[14px] leading-[1.55] text-[#111827] sm:text-[15px]`}>
                                            {recommendationSummary.midpointLabel}
                                        </p>
                                    </div>
                                    <div className="rounded-[14px] bg-[#faf7ff] px-3 py-3">
                                        <p className={`${friendsBodyFont.className} text-[11px] uppercase tracking-[0.18em] text-[#8a7be5]`}>
                                            점수 반영
                                        </p>
                                        <p className={`${friendsDisplayFont.className} mt-2 text-[14px] leading-[1.55] text-[#111827] sm:text-[15px]`}>
                                            {recommendationSummary.scoringLabel}
                                        </p>
                                    </div>
                                </div>
                            </article>

                            {recommendationCards.map((recommendationCard) => (
                                <article
                                    key={recommendationCard.id}
                                    className="rounded-[18px] bg-white/90 px-4 py-4 shadow-[0px_12px_30px_rgba(52,41,104,0.1)]"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <p className={`${friendsHeadingFont.className} break-keep text-[18px] text-[#111827] sm:text-[20px] lg:text-[22px]`}>
                                                {recommendationCard.rank}. {recommendationCard.name}
                                            </p>
                                            <p className={`${friendsBodyFont.className} mt-1 text-[12px] text-[#6c5ce7] sm:text-[13px] lg:text-[14px]`}>
                                                {recommendationCard.category}
                                            </p>
                                        </div>
                                        <div className={`${friendsBodyFont.className} w-fit rounded-full bg-[#f3eeff] px-3 py-1 text-[11px] text-[#6c5ce7] sm:text-[12px]`}>
                                            나 {recommendationCard.myDistance} · 친구 {recommendationCard.friendDistance}
                                        </div>
                                    </div>
                                    <p className={`${friendsDisplayFont.className} break-keep mt-3 text-[13px] leading-[1.6] text-[#4a5568] sm:text-[14px] lg:text-[15px]`}>
                                        {recommendationCard.summary}
                                    </p>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-[18px] border border-dashed border-white/70 bg-white/55 px-4 py-8 text-center">
                            <p className={`${friendsHeadingFont.className} break-keep text-[18px] text-[#111827] sm:text-[20px] lg:text-[22px]`}>
                                추천 결과를 아직 불러오지 않았어요.
                            </p>
                            <p className={`${friendsDisplayFont.className} break-keep mt-2 text-[13px] leading-[1.6] text-[#6b7280] sm:text-[14px] lg:text-[15px]`}>
                                {meetingMode === "now"
                                    ? "위치 공유 후 추천을 시작하면 상위 3개 장소와 추천 기준을 여기서 바로 비교할 수 있어요."
                                    : "출발 위치를 정하고 추천을 시작하면 상위 3개 장소와 추천 기준을 여기서 바로 비교할 수 있어요."}
                            </p>
                        </div>
                    )}
                </div>
            </ChatSectionCard>
        </div>
    );
}