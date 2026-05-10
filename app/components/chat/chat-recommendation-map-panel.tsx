import Image from "next/image";

import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../friends/fonts";
import { KakaoMapPreview } from "./kakao-map-preview";
import { ChatSectionCard } from "./chat-ui";
import type { RecommendationSummary } from "./types";

type ChatRecommendationMapPanelProps = {
    recommendationSummary: RecommendationSummary;
    hasRecommendations: boolean;
    mapMarkerLabels: string[];
};

export function ChatRecommendationMapPanel({
    recommendationSummary,
    hasRecommendations,
    mapMarkerLabels,
}: ChatRecommendationMapPanelProps) {
    return (
        <ChatSectionCard className="px-4 py-5 sm:px-6 sm:py-6 lg:px-6 xl:px-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className={`${friendsDisplayFont.className} text-[14px] text-[#111827] sm:text-[16px]`}>
                        추천 장소 지도
                    </p>
                    <div className="mt-2">
                        {hasRecommendations ? (
                            <>
                                <p className={`${friendsHeadingFont.className} text-[18px] text-[#111827] sm:text-[20px]`}>
                                    추천 결과에 맞춰 지도 마커를 표시해요.
                                </p>
                                <p className={`${friendsDisplayFont.className} mt-2 text-[13px] leading-[1.6] text-[#5f6782] sm:text-[14px]`}>
                                    추천 버튼을 누르면 중심점과 장소 3개가 지도와 결과 카드에 함께 반영됩니다.
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className={`${friendsBodyFont.className} rounded-full bg-[#ede7ff] px-3 py-1 text-[11px] text-[#5f47d2]`}>
                                        내 위치
                                    </span>
                                    <span className={`${friendsBodyFont.className} rounded-full bg-[#ede7ff] px-3 py-1 text-[11px] text-[#5f47d2]`}>
                                        친구 위치
                                    </span>
                                    <span className={`${friendsBodyFont.className} rounded-full bg-[#ede7ff] px-3 py-1 text-[11px] text-[#5f47d2]`}>
                                        중심점
                                    </span>
                                    {mapMarkerLabels.map((label) => (
                                        <span
                                            key={label}
                                            className={`${friendsBodyFont.className} rounded-full bg-white px-3 py-1 text-[11px] text-[#2b2373] shadow-[0px_8px_20px_rgba(52,41,104,0.08)]`}
                                        >
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={`${friendsHeadingFont.className} text-[18px] text-[#111827] sm:text-[20px]`}>
                                    추천 전에는 기본 안내 이미지를 보여 줍니다.
                                </p>
                                <p className={`${friendsDisplayFont.className} mt-2 text-[13px] leading-[1.6] text-[#5f6782] sm:text-[14px]`}>
                                    조건을 정한 뒤 추천 버튼을 누르면 이 패널이 카카오맵과 마커 표시 화면으로 전환됩니다.
                                </p>
                            </>
                        )}
                    </div>
                </div>
                <span className={`${friendsBodyFont.className} w-fit rounded-full bg-[#f3eeff] px-3 py-1 text-[11px] text-[#6c5ce7] sm:text-[12px]`}>
                    {recommendationSummary.modeLabel}
                </span>
            </div>

            <div className="mt-4 rounded-[20px] border border-[#ddd8ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(241,237,255,0.92)_100%)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] sm:px-5 sm:py-5">
                {hasRecommendations ? (
                    <KakaoMapPreview placeLabels={mapMarkerLabels} />
                ) : (
                    <div className="flex justify-center overflow-hidden rounded-2xl border border-[#d9d4ff] bg-white px-4 py-4 sm:px-6 sm:py-6">
                        <Image
                            src="/meetMap.png"
                            alt="추천 전 지도 안내 이미지"
                            width={772}
                            height={514}
                            loading="eager"
                            className="h-auto w-full max-w-160 object-contain object-center"
                        />
                    </div>
                )}
            </div>
        </ChatSectionCard>
    );
}