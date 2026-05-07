import Image from "next/image";

import { friendsGradientBackground } from "../friends/data";
import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../friends/fonts";
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
            <section className="rounded-[22px] bg-white px-4 py-5 shadow-[0px_18px_44px_rgba(52,41,104,0.14)] sm:rounded-[24px] sm:px-6 sm:py-6 lg:rounded-[26px] lg:px-6 xl:px-7">
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

                <button
                    type="button"
                    onClick={onShareLocation}
                    className={`${friendsHeadingFont.className} mt-5 inline-flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-[12px] border-[3px] border-white px-6 py-2.5 text-[17px] font-bold text-white shadow-[0px_10px_24px_rgba(108,92,231,0.18)] transition-opacity hover:opacity-95 sm:min-h-[52px] sm:text-[18px]`}
                    style={{ backgroundImage: friendsGradientBackground }}
                >
                    위치 공유하기
                </button>
            </section>

            <section className="relative overflow-hidden rounded-[22px] bg-[#dcd2ff] px-4 py-5 shadow-[0px_18px_44px_rgba(52,41,104,0.12)] sm:rounded-[24px] sm:px-6 sm:py-6 lg:rounded-[26px] lg:px-6 xl:px-7">
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

                        <button
                            type="button"
                            onClick={onRecommend}
                            className={`${friendsHeadingFont.className} inline-flex min-h-[52px] w-full cursor-pointer items-center justify-center rounded-[16px] border border-white/50 bg-[linear-gradient(198.712deg,#6675f7_0%,#57007b_100%)] px-6 py-3 text-[17px] font-bold leading-none text-white shadow-[0px_16px_32px_rgba(87,0,123,0.22)] transition-[transform,box-shadow,opacity] duration-200 ease-out hover:-translate-y-[1px] hover:shadow-[0px_20px_36px_rgba(87,0,123,0.26)] hover:opacity-100 sm:min-h-[56px] sm:w-auto sm:px-7 sm:py-3.5 sm:text-[18px]`}
                        >
                            추천 시작하기
                        </button>
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
            </section>
        </div>
    );
}