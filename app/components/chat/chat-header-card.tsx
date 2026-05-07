import { getFriendInitial } from "../friends/data";
import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../friends/fonts";
import type { FriendItem } from "../friends/types";
import { ChatActionButton, ChatSectionCard } from "./chat-ui";

type ChatHeaderCardProps = {
    selectedFriend: FriendItem;
    lastSharedAt: string | null;
};

export function ChatHeaderCard({ selectedFriend, lastSharedAt }: ChatHeaderCardProps) {
    return (
        <ChatSectionCard className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-[#d9d9d9] text-[18px] text-[#111827] sm:h-[56px] sm:w-[56px] sm:text-[22px] lg:h-[58px] lg:w-[58px] lg:text-[24px]">
                        <span className={`${friendsDisplayFont.className} leading-none`}>
                            {getFriendInitial(selectedFriend.nickname)}
                        </span>
                    </div>

                    <div className="min-w-0 space-y-1.5">
                        <h2 className={`${friendsHeadingFont.className} break-keep text-[20px] font-bold leading-[1.15] text-[#111827] sm:text-[24px] lg:text-[30px]`}>
                            {selectedFriend.nickname} 님과의 채팅
                        </h2>
                        <p className={`${friendsDisplayFont.className} break-keep text-[13px] leading-[1.55] text-[#6b7280] sm:text-[15px] lg:text-[17px]`}>
                            마지막 위치 공유: {lastSharedAt ?? "아직 공유 전"}
                        </p>
                        <p className={`${friendsBodyFont.className} break-keep text-[12px] leading-[1.5] text-[#6c5ce7] sm:text-[13px] lg:text-[14px]`}>
                            현재 추천 기준 대상 친구로 선택되어 있어요.
                        </p>
                    </div>
                </div>

                <ChatActionButton
                    variant="outline"
                    className={`${friendsDisplayFont.className} min-h-[46px] w-full rounded-[12px] px-4 py-2.5 text-[15px] sm:min-h-[48px] sm:w-auto sm:px-6 sm:py-3 sm:text-[17px] lg:text-[18px]`}
                >
                    지도에서 위치 확인
                </ChatActionButton>
            </div>
        </ChatSectionCard>
    );
}