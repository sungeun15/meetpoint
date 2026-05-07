import Image from "next/image";

import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../friends/fonts";
import { ChatActionButton, ChatSectionCard } from "./chat-ui";
import type { RecommendationCard } from "./types";

type ChatStatusPanelsProps = {
    myLocationStatus: string;
    friendLocationStatus: string;
    onShareLocation: () => void;
    onRecommend: () => void;
    hasRecommendations: boolean;
    recommendationCards: RecommendationCard[];
};

export function ChatStatusPanels({
    myLocationStatus,
    friendLocationStatus,
    onShareLocation,
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
                                지도와 추천 보기
                            </h3>
                            <p className={`${friendsDisplayFont.className} break-keep text-[13px] leading-[1.6] text-[#6b7280] sm:text-[15px] lg:text-[16px]`}>
                                위치 공유 후 추천을 시작하면 중심점과 장소 후보를 함께 확인할 수 있어요.
                            </p>
                        </div>

                        <ChatActionButton
                            variant="accent"
                            onClick={onRecommend}
                            className={`${friendsHeadingFont.className} min-h-[52px] w-full rounded-[16px] px-6 py-3 text-[17px] font-bold leading-none sm:min-h-[56px] sm:w-auto sm:px-7 sm:py-3.5 sm:text-[18px]`}
                        >
                            추천 시작하기
                        </ChatActionButton>
                    </div>

                    {hasRecommendations ? (
                        <div className="grid gap-3">
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
                                위치 공유 후 추천을 시작하면 상위 3개 장소를 여기서 바로 비교할 수 있어요.
                            </p>
                        </div>
                    )}
                </div>
            </ChatSectionCard>
        </div>
    );
}