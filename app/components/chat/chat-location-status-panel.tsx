import { useState } from "react";

import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../friends/fonts";
import { ChatActionButton, ChatSectionCard } from "./chat-ui";

type ChatLocationStatusPanelProps = {
    myLocationStatus: string;
    friendLocationStatus: string;
    lastSharedAt: string | null;
    canSaveMyLocation: boolean;
    canSaveFriendLocation: boolean;
    onShareLocation: () => void;
    onOpenSaveLocationLayer: (party: "me" | "friend", previewValue: string, sourceLabel: string) => void;
};

export function ChatLocationStatusPanel({
    myLocationStatus,
    friendLocationStatus,
    lastSharedAt,
    canSaveMyLocation,
    canSaveFriendLocation,
    onShareLocation,
    onOpenSaveLocationLayer,
}: ChatLocationStatusPanelProps) {
    const [isMobileStatusCollapsed, setIsMobileStatusCollapsed] = useState(true);

    return (
        <ChatSectionCard className="px-3 py-3 sm:px-5 sm:py-4.5 lg:px-6">
            <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex-1 space-y-1.5 sm:space-y-2">
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center justify-between gap-2 sm:block">
                            <h3 className={`${friendsHeadingFont.className} text-[17px] font-bold text-[#111827] sm:text-[21px] lg:text-[24px]`}>
                                위치 상태
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsMobileStatusCollapsed((currentValue) => !currentValue)}
                                className="rounded-full border border-[#ddd8ff] bg-white/82 px-2.5 py-1 text-[11px] font-semibold text-[#5f47d2] sm:hidden"
                            >
                                {isMobileStatusCollapsed ? "펼치기" : "접기"}
                            </button>
                        </div>
                        <p className={`${friendsBodyFont.className} hidden text-[11px] text-[#6b7280] sm:block sm:text-[13px]`}>
                            현재 공유 상태를 빠르게 확인해요.
                        </p>
                    </div>

                    <p className={`${friendsBodyFont.className} text-[10px] text-[#7a7399] sm:hidden`}>
                        {lastSharedAt ? `마지막 공유 ${lastSharedAt}` : "아직 위치 공유 전"}
                    </p>

                    <div className={`${isMobileStatusCollapsed ? "hidden" : "grid"} gap-2 sm:grid md:grid-cols-2`}>
                        <div className="rounded-[18px] bg-[#f8f5ff] px-3 py-2.5">
                            <div className="flex items-start gap-2.5">
                                <p className={`${friendsDisplayFont.className} shrink-0 text-[11px] text-[#111827] sm:text-[14px] lg:text-[15px]`}>
                                    내 위치 상태
                                </p>
                                <p
                                    title={myLocationStatus}
                                    className={`${friendsBodyFont.className} min-w-0 flex-1 truncate text-[10px] leading-[1.35] text-[#6b7280] sm:text-[13px] lg:text-[14px]`}
                                >
                                    {myLocationStatus}
                                </p>
                            </div>
                            <p className={`${friendsBodyFont.className} mt-1 hidden text-[10px] text-[#7a7399] sm:block sm:text-[12px]`}>
                                마지막 공유 시각: {lastSharedAt ?? "아직 없음"}
                            </p>
                            <ChatActionButton
                                variant="outline"
                                onClick={() => onOpenSaveLocationLayer("me", myLocationStatus, "현재 위치 상태")}
                                disabled={!canSaveMyLocation}
                                className={`${friendsHeadingFont.className} mt-2 min-h-9 w-full rounded-xl px-3 py-1.5 text-[12px] font-bold sm:min-h-11 sm:px-3.5 sm:py-2 sm:text-[14px]`}
                            >
                                내 위치 저장
                            </ChatActionButton>
                        </div>
                        <div className="rounded-[18px] bg-[#f8f5ff] px-3 py-2.5">
                            <div className="flex items-start gap-2.5">
                                <p className={`${friendsDisplayFont.className} shrink-0 text-[11px] text-[#111827] sm:text-[14px] lg:text-[15px]`}>
                                    친구 위치 상태
                                </p>
                                <p
                                    title={friendLocationStatus}
                                    className={`${friendsBodyFont.className} min-w-0 flex-1 truncate text-[10px] leading-[1.35] text-[#6b7280] sm:text-[13px] lg:text-[14px]`}
                                >
                                    {friendLocationStatus}
                                </p>
                            </div>
                            <p className={`${friendsBodyFont.className} mt-1 hidden text-[10px] text-[#7a7399] sm:block sm:text-[12px]`}>
                                친구 좌표 기준 상태를 추천 지도와 함께 반영해요.
                            </p>
                            <ChatActionButton
                                variant="outline"
                                onClick={() => onOpenSaveLocationLayer("friend", friendLocationStatus, "친구 위치 상태")}
                                disabled={!canSaveFriendLocation}
                                className={`${friendsHeadingFont.className} mt-2 min-h-9 w-full rounded-xl px-3 py-1.5 text-[12px] font-bold sm:min-h-11 sm:px-3.5 sm:py-2 sm:text-[14px]`}
                            >
                                친구 위치 저장
                            </ChatActionButton>
                        </div>
                    </div>
                </div>

                <ChatActionButton
                    onClick={onShareLocation}
                    className={`${friendsHeadingFont.className} min-h-10 w-full shrink-0 rounded-[12px] px-3.5 py-1.5 text-[13px] font-bold sm:w-auto sm:min-h-[46px] sm:px-4 sm:py-2 sm:text-[16px] xl:min-w-[148px]`}
                >
                    위치 공유하기
                </ChatActionButton>
            </div>
        </ChatSectionCard>
    );
}
