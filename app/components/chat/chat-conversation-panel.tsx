import { useEffect, useRef, useState, type FormEvent } from "react";

import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../friends/fonts";
import type { FriendItem } from "../friends/types";
import { FriendInitialAvatar } from "../shared/friend-initial-avatar";
import { ChatActionButton, ChatSectionCard } from "./chat-ui";
import type { ChatMessage } from "./types";

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

type ChatMessageItemProps = {
    message: ChatMessage;
    friendName: string;
};

type ConversationRow =
    | {
        type: "date-divider";
        key: string;
        label: string;
    }
    | {
        type: "message";
        key: string;
        message: ChatMessage;
    };

const MOBILE_OLDER_MESSAGES_AUTOLOAD_THRESHOLD_PX = 72;
const DESKTOP_OLDER_MESSAGES_AUTOLOAD_THRESHOLD_PX = 120;
const FRIEND_MESSAGE_NAME_CLASS_NAME = `${friendsBodyFont.className} px-1 text-[11px] text-[#4b5563] sm:text-[13px] lg:text-[15px]`;
const MESSAGE_BUBBLE_BASE_CLASS_NAME = `${friendsDisplayFont.className} break-keep rounded-[14px] px-2 py-2 text-[13px] leading-[1.45] tracking-[0.01em] shadow-[0px_4px_10px_rgba(15,23,42,0.04)] sm:rounded-[16px] sm:px-3 sm:py-2.5 sm:text-[15px] lg:text-[17px]`;
const MESSAGE_FORM_CLASS_NAME = "flex flex-col gap-2 rounded-[16px] border-t border-[#ebe8fb] bg-[#faf9ff] px-1.5 pt-3.5 pb-1.5 md:flex-row md:items-center md:gap-3 md:rounded-[18px] md:px-0 md:pt-3 md:pb-0 md:bg-transparent";
const MESSAGE_INPUT_CLASS_NAME = `${friendsDisplayFont.className} h-[68px] flex-1 rounded-[11px] border-2 border-[#d8dbe6] bg-white px-3.5 py-3 text-[14px] text-[#111827] placeholder:text-[13px] placeholder:text-[#a3acbf] outline-none transition focus:border-[#8b7cf6] focus:shadow-[0_0_0_4px_rgba(108,92,231,0.08)] sm:h-[54px] sm:rounded-[12px] sm:px-4 sm:py-0 sm:text-[17px] sm:placeholder:text-[15px] lg:text-[20px]`;
const MESSAGE_SEND_BUTTON_CLASS_NAME = `${friendsHeadingFont.className} min-h-10 w-full rounded-[11px] px-3.5 py-1 text-[13px] font-bold sm:min-h-[54px] sm:rounded-[12px] sm:px-5 sm:py-1.5 sm:text-[18px] md:w-[112px] lg:w-[120px]`;

function getOlderMessagesAutoloadThresholdPx() {
    if (typeof window === "undefined") {
        return DESKTOP_OLDER_MESSAGES_AUTOLOAD_THRESHOLD_PX;
    }

    return window.innerWidth < 640
        ? MOBILE_OLDER_MESSAGES_AUTOLOAD_THRESHOLD_PX
        : DESKTOP_OLDER_MESSAGES_AUTOLOAD_THRESHOLD_PX;
}

function formatConversationDateLabel(createdAt: string) {
    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
        return "날짜 확인 필요";
    }

    const formattedDate = new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(date);

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const targetStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const differenceInDays = Math.round((todayStart.getTime() - targetStart.getTime()) / 86400000);

    if (differenceInDays === 0) {
        return `${formattedDate} (오늘)`;
    }

    if (differenceInDays === 1) {
        return `${formattedDate} (어제)`;
    }

    return formattedDate;
}

function buildConversationRows(messages: ChatMessage[]) {
    const rows: ConversationRow[] = [];
    let previousDateKey: string | null = null;

    for (const message of messages) {
        const dateKey = message.createdAt.slice(0, 10);

        if (dateKey !== previousDateKey) {
            rows.push({
                type: "date-divider",
                key: `date-divider-${dateKey}`,
                label: formatConversationDateLabel(message.createdAt),
            });
            previousDateKey = dateKey;
        }

        rows.push({
            type: "message",
            key: message.id,
            message,
        });
    }

    return rows;
}

function ChatMessageItem({ message, friendName }: ChatMessageItemProps) {
    const isMine = message.sender === "me";

    return (
        <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
            <div className={`flex max-w-[94%] items-end gap-2 sm:max-w-[88%] sm:gap-3 lg:max-w-[min(84%,620px)] ${isMine ? "justify-end" : "justify-start"}`}>
                {!isMine ? (
                    <FriendInitialAvatar
                        nickname={friendName}
                        className="h-7 w-7 text-[11px] sm:h-9 sm:w-9 sm:text-[14px] lg:h-10 lg:w-10 lg:text-[16px]"
                    />
                ) : null}

                <div className={`space-y-1.5 sm:space-y-2 ${isMine ? "items-end" : "items-start"}`}>
                    {!isMine ? (
                        <p className={FRIEND_MESSAGE_NAME_CLASS_NAME}>
                            {friendName}
                        </p>
                    ) : null}
                    <div
                        className={`${MESSAGE_BUBBLE_BASE_CLASS_NAME} ${isMine
                            ? "bg-[#8378eb] text-[#fbfaff]"
                            : "bg-[#f0ecf8] text-[#273142]"
                            }`}
                    >
                        {message.text}
                    </div>
                </div>
            </div>
        </div>
    );
}

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
    const conversationViewportRef = useRef<HTMLDivElement | null>(null);
    const previousScrollHeightRef = useRef(0);
    const shouldRestoreScrollPositionRef = useRef(false);
    const latestMessageKey = latestMessage?.id ?? "";
    const conversationRows = buildConversationRows(messages);

    async function handleLoadOlderClick() {
        if (isLoadingOlderMessages) {
            return;
        }

        const viewportElement = conversationViewportRef.current;

        if (viewportElement) {
            previousScrollHeightRef.current = viewportElement.scrollHeight;
            shouldRestoreScrollPositionRef.current = true;
        }

        const didLoadOlderMessages = await onLoadOlderMessages();

        if (!didLoadOlderMessages) {
            shouldRestoreScrollPositionRef.current = false;
            previousScrollHeightRef.current = 0;
        }
    }

    function handleConversationScroll(event: React.UIEvent<HTMLDivElement>) {
        if (!canLoadOlderMessages || isLoadingOlderMessages || isLoadingMessages || shouldRestoreScrollPositionRef.current) {
            return;
        }

        if (event.currentTarget.scrollTop <= getOlderMessagesAutoloadThresholdPx()) {
            void handleLoadOlderClick();
        }
    }

    useEffect(() => {
        const viewportElement = conversationViewportRef.current;

        if (!viewportElement || viewportElement.offsetParent === null) {
            return;
        }

        const animationFrameId = window.requestAnimationFrame(() => {
            viewportElement.scrollTop = viewportElement.scrollHeight;
        });

        return () => {
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [isMobileConversationCollapsed, latestMessageKey, selectedFriend.id]);

    useEffect(() => {
        if (!shouldRestoreScrollPositionRef.current) {
            return;
        }

        const viewportElement = conversationViewportRef.current;

        if (!viewportElement) {
            shouldRestoreScrollPositionRef.current = false;
            previousScrollHeightRef.current = 0;
            return;
        }

        const animationFrameId = window.requestAnimationFrame(() => {
            const scrollDelta = viewportElement.scrollHeight - previousScrollHeightRef.current;
            viewportElement.scrollTop += scrollDelta;
            shouldRestoreScrollPositionRef.current = false;
            previousScrollHeightRef.current = 0;
        });

        return () => {
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [messages.length]);

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
                {isMobileConversationCollapsed ? (
                    <div className="rounded-[18px] border border-dashed border-[#d8d2fb] bg-[#faf8ff] px-3 py-2.5 sm:hidden">
                        {isLoadingMessages ? (
                            <p className={`${friendsDisplayFont.className} text-[12px] text-[#6b7280]`}>
                                메시지를 불러오는 중이에요.
                            </p>
                        ) : latestMessage ? (
                            <div className="space-y-1">
                                <p className={`${friendsBodyFont.className} text-[10px] text-[#7a7399]`}>
                                    최근 대화 미리보기
                                </p>
                                <p className={`${friendsDisplayFont.className} truncate text-[12px] text-[#111827]`}>
                                    {latestMessage.sender === "me" ? "나" : selectedFriend.nickname}: {latestMessage.text}
                                </p>
                            </div>
                        ) : (
                            <p className={`${friendsDisplayFont.className} text-[12px] text-[#6b7280]`}>
                                아직 대화가 없어 입력창에서 바로 시작할 수 있어요.
                            </p>
                        )}
                    </div>
                ) : null}

                <div
                    ref={conversationViewportRef}
                    onScroll={handleConversationScroll}
                    className={`${isMobileConversationCollapsed ? "hidden sm:block" : "block"} h-[240px] overflow-y-auto pr-1 sm:h-[300px] sm:pr-2 lg:h-[340px] xl:h-[380px]`}
                >
                    <div className="flex min-h-full flex-col gap-3 sm:gap-4">
                        {isLoadingOlderMessages ? (
                            <div className="sticky top-0 z-10 flex justify-center">
                                <div className="rounded-full border border-[#ddd8ff] bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-[#5f47d2] shadow-[0px_8px_18px_rgba(108,92,231,0.08)] backdrop-blur sm:text-[12px]">
                                    이전 메시지를 불러오는 중...
                                </div>
                            </div>
                        ) : null}

                        {isLoadingMessages ? (
                            <div className="space-y-3 sm:space-y-4">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div
                                        key={`chat-message-skeleton-${index}`}
                                        className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
                                    >
                                        <div className="max-w-[88%] rounded-[18px] bg-[#f3efff] px-4 py-3">
                                            <div className="h-4 w-40 animate-pulse rounded-full bg-[#e1d8ff] sm:w-56" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : messages.length > 0 ? (
                            conversationRows.map((row) => row.type === "date-divider" ? (
                                <div key={row.key} className="sticky top-0 z-5 -mx-1 flex justify-center py-1.5">
                                    <div className="inline-flex items-center rounded-full border border-[#ddd8ff] bg-white/92 px-3 py-1 shadow-[0px_8px_18px_rgba(108,92,231,0.08)] backdrop-blur sm:px-3.5">
                                        <p className={`${friendsBodyFont.className} shrink-0 text-[11px] font-semibold text-[#7a7399] sm:text-[12px]`}>
                                            {row.label}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <ChatMessageItem
                                    key={row.key}
                                    message={row.message}
                                    friendName={selectedFriend.nickname}
                                />
                            ))
                        ) : (
                            <div className="flex flex-1 items-center justify-center rounded-[18px] border border-dashed border-[#d1d5db] bg-[#fcfbff] px-4 py-8 text-center sm:px-5 sm:py-12">
                                <div className="space-y-2">
                                    <p className={`${friendsHeadingFont.className} break-keep text-[16px] text-[#111827] sm:text-[22px] lg:text-[24px]`}>
                                        아직 주고받은 메시지가 없습니다.
                                    </p>
                                    <p className={`${friendsDisplayFont.className} break-keep text-[13px] text-[#6b7280] sm:text-[16px] lg:text-[17px]`}>
                                        첫 메시지를 보내 대화를 시작해 보세요.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <form className={MESSAGE_FORM_CLASS_NAME} onSubmit={onSendMessage}>
                    <input
                        type="text"
                        value={draftMessage}
                        onChange={(event) => onDraftMessageChange(event.target.value)}
                        placeholder="메세지를 입력하세요."
                        className={MESSAGE_INPUT_CLASS_NAME}
                    />

                    <ChatActionButton
                        type="submit"
                        className={MESSAGE_SEND_BUTTON_CLASS_NAME}
                    >
                        전송
                    </ChatActionButton>
                </form>

                {feedbackMessage ? (
                    <p className={`${friendsBodyFont.className} break-keep text-[11px] leading-[1.6] text-[#dc2626] sm:text-[13px] lg:text-[14px]`}>
                        {feedbackMessage}
                    </p>
                ) : null}
            </div>
        </ChatSectionCard>
    );
}