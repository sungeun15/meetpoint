import { useEffect, useState } from "react";

import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../friends/fonts";
import type { FriendItem } from "../friends/types";
import { FriendInitialAvatar } from "../shared/friend-initial-avatar";
import { ChatActionButton, ChatSectionCard } from "./chat-ui";
import type { ResolvedLocation } from "./types";

type ChatHeaderCardProps = {
    selectedFriend: FriendItem;
    lastSharedAt: string | null;
    friendResolvedLocation: ResolvedLocation | null;
    selectedFriendDepartureLocation: ResolvedLocation | null;
    onOpenLocationMap: (title: string, description: string, location: ResolvedLocation | null) => void;
};

export function ChatHeaderCard({
    selectedFriend,
    lastSharedAt,
    friendResolvedLocation,
    selectedFriendDepartureLocation,
    onOpenLocationMap,
}: ChatHeaderCardProps) {
    const [isMobileHeaderCollapsed, setIsMobileHeaderCollapsed] = useState(true);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!feedbackMessage) return;

        const timeoutId = setTimeout(() => {
            setFeedbackMessage(null);
        }, 3000);

        return () => clearTimeout(timeoutId);
    }, [feedbackMessage]);

    return (
        <ChatSectionCard className="px-3 py-3 sm:px-5 sm:py-4 lg:px-8 lg:py-6">
            <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-start gap-2.5 sm:gap-4">
                    <FriendInitialAvatar
                        nickname={selectedFriend.nickname}
                        className="h-10 w-10 text-[16px] sm:h-[52px] sm:w-[52px] sm:text-[21px] lg:h-[58px] lg:w-[58px] lg:text-[24px]"
                    />

                    <div className="min-w-0 space-y-1 sm:space-y-1.5">
                        <div className="flex items-center justify-between gap-2 sm:block">
                            <h2 className={`${friendsHeadingFont.className} break-keep text-[17px] font-bold leading-[1.12] text-[#111827] sm:text-[22px] lg:text-[30px]`}>
                                {selectedFriend.nickname} 님과의 채팅
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsMobileHeaderCollapsed((currentValue) => !currentValue)}
                                className="rounded-full border border-[#ddd8ff] bg-white/82 px-2.5 py-1 text-[11px] font-semibold text-[#5f47d2] sm:hidden"
                            >
                                {isMobileHeaderCollapsed ? "펼치기" : "접기"}
                            </button>
                        </div>
                        <p className={`${friendsDisplayFont.className} text-[11px] leading-[1.45] text-[#6b7280] sm:hidden`}>
                            {lastSharedAt ? `마지막 공유 ${lastSharedAt}` : "아직 공유 전"}
                        </p>
                        <div className={`${isMobileHeaderCollapsed ? "hidden" : "block"} sm:block`}>
                            <p className={`${friendsDisplayFont.className} break-keep text-[11px] leading-[1.45] text-[#6b7280] sm:text-[14px] lg:text-[17px]`}>
                                마지막 위치 공유: {lastSharedAt ?? "아직 공유 전"}
                            </p>
                            <p className={`${friendsBodyFont.className} mt-1 hidden break-keep text-[11px] leading-[1.5] text-[#6c5ce7] sm:block sm:text-[12px] lg:text-[14px]`}>
                                현재 추천 기준 대상 친구로 선택되어 있어요.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid w-full gap-2 sm:w-auto xl:min-w-58 xl:shrink-0">
                    <ChatActionButton
                        variant="outline"
                        onClick={() => {
                            if (!friendResolvedLocation) {
                                setFeedbackMessage("친구가 아직 위치를 공유하지 않았어요.");
                                return;
                            }

                            onOpenLocationMap(
                                `${selectedFriend.nickname} 위치`,
                                "현재 대화 중인 친구의 공유 위치를 팝업 레이어 안에서 바로 확인합니다.",
                                friendResolvedLocation,
                            );
                        }}
                        className={`${friendsDisplayFont.className} min-h-10 w-full rounded-[12px] px-3 py-1.5 text-[13px] sm:min-h-[46px] sm:px-5 sm:py-2.5 sm:text-[16px] lg:text-[18px]`}
                    >
                        친구 현재 위치 확인
                    </ChatActionButton>

                    {selectedFriendDepartureLocation ? (
                        <ChatActionButton
                            variant="outline"
                            onClick={() => {
                                onOpenLocationMap(
                                    `${selectedFriend.nickname} 선택 출발 위치`,
                                    `현재 선택된 저장 출발 위치인 ${selectedFriendDepartureLocation.label} 를 팝업 레이어 안에서 바로 확인합니다.`,
                                    selectedFriendDepartureLocation,
                                );
                            }}
                            className={`${friendsDisplayFont.className} min-h-10 w-full rounded-[12px] px-3 py-1.5 text-[13px] sm:min-h-[46px] sm:px-5 sm:py-2.5 sm:text-[16px] lg:text-[18px]`}
                        >
                            선택한 출발 위치 확인
                        </ChatActionButton>
                    ) : null}
                </div>
            </div>

            {feedbackMessage && (
                <div className="mt-3 rounded-[8px] bg-[#fef3f2] px-3 py-2 text-[12px] leading-[1.5] text-[#d32f2f] sm:text-[13px]">
                    {feedbackMessage}
                </div>
            )}
        </ChatSectionCard>
    );
}