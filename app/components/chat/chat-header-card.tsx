import { useEffect, useState } from "react";

import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../friends/fonts";
import type { FriendItem } from "../friends/types";
import { FriendInitialAvatar } from "../shared/friend-initial-avatar";
import { ModalShell } from "../shared/modal-shell";
import { ChatActionButton, ChatSectionCard } from "./chat-ui";
import type { LocationMapMarkerVariant, ResolvedLocation } from "./types";

type ChatHeaderCardProps = {
    selectedFriend: FriendItem;
    lastSharedAt: string | null;
    friendResolvedLocation: ResolvedLocation | null;
    selectedFriendDepartureLocation: ResolvedLocation | null;
    onOpenLocationMap: (
        title: string,
        description: string,
        location: ResolvedLocation | null,
        markerVariant?: LocationMapMarkerVariant,
    ) => void;
    onLeaveChatRoom: () => Promise<boolean>;
};

export function ChatHeaderCard({
    selectedFriend,
    lastSharedAt,
    friendResolvedLocation,
    selectedFriendDepartureLocation,
    onOpenLocationMap,
    onLeaveChatRoom,
}: ChatHeaderCardProps) {
    const [isMobileHeaderCollapsed, setIsMobileHeaderCollapsed] = useState(true);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [isLeaveConfirmLayerOpen, setIsLeaveConfirmLayerOpen] = useState(false);
    const [isLeavingChatRoom, setIsLeavingChatRoom] = useState(false);
    const headerActionButtonClassName = `${friendsDisplayFont.className} min-h-9 w-full rounded-[12px] px-2.5 py-1.5 text-[12px] sm:min-h-[42px] sm:px-4 sm:py-2 sm:text-[14px] lg:text-[16px]`;
    const destructiveHeaderActionButtonClassName = `${headerActionButtonClassName} border-[#ef4444] text-[#ef4444] hover:bg-[#fff1f2] hover:shadow-none`;

    useEffect(() => {
        if (!feedbackMessage) return;

        const timeoutId = setTimeout(() => {
            setFeedbackMessage(null);
        }, 3000);

        return () => clearTimeout(timeoutId);
    }, [feedbackMessage]);

    function handleOpenFriendLocationMap() {
        if (!friendResolvedLocation) {
            setFeedbackMessage("친구가 아직 위치를 공유하지 않았어요.");
            return;
        }

        onOpenLocationMap(
            `${selectedFriend.nickname} 위치`,
            "현재 대화 중인 친구의 공유 위치를 팝업 레이어 안에서 바로 확인합니다.",
            friendResolvedLocation,
            "friend",
        );
    }

    function handleOpenSavedFriendLocationMap() {
        if (!selectedFriendDepartureLocation) {
            setFeedbackMessage("저장된 친구 위치가 없어요.");
            return;
        }

        onOpenLocationMap(
            `${selectedFriend.nickname} 저장 위치`,
            `현재 선택된 저장 친구 위치인 ${selectedFriendDepartureLocation.label} 를 팝업 레이어 안에서 바로 확인합니다.`,
            selectedFriendDepartureLocation,
            "friend",
        );
    }

    async function handleLeaveChatRoomClick() {
        if (isLeavingChatRoom) {
            return;
        }

        setIsLeaveConfirmLayerOpen(true);
    }

    function handleCloseLeaveConfirmLayer() {
        if (isLeavingChatRoom) {
            return;
        }

        setIsLeaveConfirmLayerOpen(false);
    }

    async function handleConfirmLeaveChatRoom() {
        if (isLeavingChatRoom) {
            return;
        }

        setIsLeavingChatRoom(true);

        try {
            await onLeaveChatRoom();
            setIsLeaveConfirmLayerOpen(false);
        } finally {
            setIsLeavingChatRoom(false);
        }
    }

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

                <div className={`${isMobileHeaderCollapsed ? "hidden" : "grid"} w-full gap-2 sm:w-auto sm:grid xl:min-w-58 xl:shrink-0`}>
                    <ChatActionButton
                        variant="outline"
                        onClick={handleOpenFriendLocationMap}
                        className={headerActionButtonClassName}
                    >
                        친구 현재 위치 확인
                    </ChatActionButton>

                    <ChatActionButton
                        variant="outline"
                        onClick={handleOpenSavedFriendLocationMap}
                        className={headerActionButtonClassName}
                    >
                        저장된 친구 위치 확인
                    </ChatActionButton>

                    <ChatActionButton
                        variant="outline"
                        onClick={handleLeaveChatRoomClick}
                        disabled={isLeavingChatRoom}
                        className={destructiveHeaderActionButtonClassName}
                    >
                        {isLeavingChatRoom ? "나가는 중..." : "채팅방 나가기"}
                    </ChatActionButton>
                </div>
            </div>

            {feedbackMessage && (
                <div className="mt-3 rounded-[8px] bg-[#fef3f2] px-3 py-2 text-[12px] leading-[1.5] text-[#d32f2f] sm:text-[13px]">
                    {feedbackMessage}
                </div>
            )}

            {isLeaveConfirmLayerOpen && (
                <ModalShell
                    title="채팅방 나가기"
                    description="채팅방에서 나가면 친구 관계와 대화 내용이 함께 정리됩니다."
                    onClose={handleCloseLeaveConfirmLayer}
                    panelClassName="max-w-lg"
                    contentClassName="space-y-4"
                >
                    <div className="rounded-2xl border border-[#ffe1e1] bg-[#fff5f5] px-4 py-4">
                        <p className={`${friendsBodyFont.className} text-[11px] uppercase tracking-[0.16em] text-[#d14343]`}>
                            확인 필요
                        </p>
                        <p className={`${friendsHeadingFont.className} mt-2 text-[20px] text-[#111827] sm:text-[22px]`}>
                            {selectedFriend.nickname} 님과의 채팅방에서 나가시겠어요?
                        </p>
                        <p className={`${friendsDisplayFont.className} mt-2 text-[14px] leading-[1.6] text-[#4f5875]`}>
                            나가기를 완료하면 현재 화면에서 채팅방이 닫히고 친구 목록에서 제거되며, 지금까지의 채팅 대화 내용도 전부 삭제됩니다.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleCloseLeaveConfirmLayer}
                            disabled={isLeavingChatRoom}
                            className={`${friendsBodyFont.className} min-h-11 flex-1 rounded-xl border border-[#ffd4d4] px-4 py-2 text-[14px] text-[#6b7280] transition-colors hover:bg-[#fff7f7] disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmLeaveChatRoom}
                            disabled={isLeavingChatRoom}
                            className={`${friendsHeadingFont.className} min-h-11 flex-1 rounded-xl bg-[#ef4444] px-4 py-2 text-[14px] font-bold text-white transition-colors hover:bg-[#dc2626] disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                            {isLeavingChatRoom ? "나가는 중..." : "채팅방 나가기"}
                        </button>
                    </div>
                </ModalShell>
            )}
        </ChatSectionCard>
    );
}