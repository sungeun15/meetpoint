import { useState, type FormEvent } from "react";

import { friendsBodyFont, friendsDisplayFont } from "../../friends/fonts";
import type { FriendItem } from "../../friends/types";
import { ChatSectionCard } from "../chat-ui";
import type { ChatMessage } from "../types";
import { ChatConversationCollapsedPreview } from "./chat-conversation-collapsed-preview";
import { ChatConversationMessageForm } from "./chat-conversation-message-form";
import { ChatConversationViewport } from "./chat-conversation-viewport";
import { useChatConversationScroll } from "./use-chat-conversation-scroll";

type ChatConversationPanelProps = {
    selectedFriend: FriendItem;
    messages: ChatMessage[];
    isLoadingMessages: boolean;
    canLoadOlderMessages: boolean;
    isLoadingOlderMessages: boolean;
    draftMessage: string;
    onDraftMessageChange: (nextValue: string) => void;
    onSendMessage: (event: FormEvent<HTMLFormElement>) => void;
    onLoadOlderMessages: () => Promise<boolean>;
    feedbackMessage: string | null;
};

export function ChatConversationPanel({
    selectedFriend,
    messages,
    isLoadingMessages,
    canLoadOlderMessages,
    isLoadingOlderMessages,
    draftMessage,
    onDraftMessageChange,
    onSendMessage,
    onLoadOlderMessages,
    feedbackMessage,
}: ChatConversationPanelProps) {
    const [isMobileConversationCollapsed, setIsMobileConversationCollapsed] = useState(true);
    const latestMessage = messages[messages.length - 1] ?? null;
    const latestMessageKey = latestMessage?.id ?? "";
    // 대화창 스크롤 하단 고정, 이전 메시지 자동 로드, 스크롤 복원은 훅에서 관리합니다.
    const { conversationViewportRef, handleConversationScroll } = useChatConversationScroll({
        canLoadOlderMessages,
        isLoadingMessages,
        isLoadingOlderMessages,
        isMobileConversationCollapsed,
        latestMessageKey,
        selectedFriendId: selectedFriend.id,
        messageCount: messages.length,
        onLoadOlderMessages,
    });

    return (
        <ChatSectionCard className="overflow-hidden">
            <div className="border-b border-[#ebe8fb] px-3.5 py-2.5 sm:px-6 sm:py-4 lg:px-8">
                <div className="flex items-center justify-between gap-2">
                    <p className={`${friendsDisplayFont.className} text-center text-[14px] text-[#4b5563] sm:flex-1 sm:text-[17px]`}>
                        대화 기록
                    </p>
                    <button
                        type="button"
                        onClick={() => setIsMobileConversationCollapsed((currentValue) => !currentValue)}
                        className="rounded-full border border-[#ddd8ff] bg-white/82 px-2.5 py-1 text-[11px] font-semibold text-[#5f47d2] sm:hidden"
                    >
                        {isMobileConversationCollapsed ? "대화 펼치기" : "대화 접기"}
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-3.5 px-3.5 py-3.5 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
                {/* 모바일에서는 접힌 상태에서 최근 대화 한 줄만 먼저 보여줍니다. */}
                {isMobileConversationCollapsed ? (
                    <ChatConversationCollapsedPreview
                        friendName={selectedFriend.nickname}
                        latestMessage={latestMessage}
                        isLoadingMessages={isLoadingMessages}
                    />
                ) : null}

                <div
                    ref={conversationViewportRef}
                    onScroll={handleConversationScroll}
                    className={`${isMobileConversationCollapsed ? "hidden sm:block" : "block"} h-60 overflow-y-auto pr-1 sm:h-75 sm:pr-2 lg:h-85 xl:h-95`}
                >
                    <ChatConversationViewport
                        friendName={selectedFriend.nickname}
                        messages={messages}
                        isLoadingMessages={isLoadingMessages}
                        isLoadingOlderMessages={isLoadingOlderMessages}
                    />
                </div>

                <ChatConversationMessageForm
                    draftMessage={draftMessage}
                    onDraftMessageChange={onDraftMessageChange}
                    onSendMessage={onSendMessage}
                />

                {feedbackMessage ? (
                    <p className={`${friendsBodyFont.className} break-keep text-[11px] leading-[1.6] text-[#6c5ce7] sm:text-[13px] lg:text-[14px]`}>
                        {feedbackMessage}
                    </p>
                ) : null}
            </div>
        </ChatSectionCard>
    );
}