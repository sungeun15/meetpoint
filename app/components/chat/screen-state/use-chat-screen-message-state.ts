import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useEffect, useMemo, useState } from "react";

import type { FriendItem } from "../../friends/types";
import { formatCurrentTime } from "../chat-screen-helpers";
import type { ChatMessage } from "../types";
import { requestApi } from "./chat-screen-state-api";

type MessageItem = {
    id: string; // 메시지 row id 입니다.
    senderId: string; // 보낸 사용자 id 입니다.
    receiverId: string; // 받은 사용자 id 입니다.
    content: string; // 메시지 본문입니다.
    readAt: string | null; // 읽음 처리 시각입니다.
    createdAt: string; // 생성 시각입니다.
};

type ReadMessageCursor = {
    id: string; // 마지막으로 읽힌 내 메시지 id 입니다.
    createdAt: string; // 커서 비교에 사용하는 생성 시각입니다.
    readAt: string; // 이 시점까지 읽혔다고 볼 읽음 시각입니다.
};

type MessagesListResponse = {
    messages: MessageItem[]; // 이번 요청으로 받은 메시지 목록입니다.
    lastMessageCreatedAt: string | null; // 서버가 본 최신 메시지 시각입니다.
    lastReadOwnMessage: ReadMessageCursor | null; // 읽음 보정에 사용할 마지막 읽음 커서입니다.
    pollingIntervalSec: number; // 서버가 제안하는 polling 간격입니다.
};

type MessageCreateResponse = {
    message: MessageItem; // 저장 직후 반환된 단건 메시지입니다.
};

type MessageFeedState = {
    friendId: string | null; // 현재 메시지 피드가 어떤 친구 기준인지 나타냅니다.
    items: ChatMessage[]; // 화면에 렌더링할 메시지 목록입니다.
    newestCreatedAt: string | null; // polling 기준점으로 쓰는 최신 메시지 시각입니다.
    newestMessageId: string | null; // 동일 시각 tie-break 에 쓰는 최신 메시지 id 입니다.
    oldestCreatedAt: string | null; // 더보기 기준점으로 쓰는 가장 오래된 메시지 시각입니다.
    oldestMessageId: string | null; // 동일 시각 tie-break 에 쓰는 가장 오래된 메시지 id 입니다.
    hasOlderMessages: boolean; // 이전 페이지가 더 남아 있는지 여부입니다.
};

type UseChatScreenMessageStateArgs = {
    activeFriendId: string; // 현재 대화 중인 친구 id 입니다.
    setFeedbackMessage: Dispatch<SetStateAction<string | null>>; // 상위 화면 피드백 문구를 갱신합니다.
    setFriends: Dispatch<SetStateAction<FriendItem[]>>; // 메시지 읽음 처리 후 친구 unreadCount 를 동기화합니다.
};

const DEFAULT_MESSAGE_POLLING_INTERVAL_MS = 5000;
const MESSAGE_PAGE_SIZE = 100;

function formatMessageTime(createdAt: string) {
    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
        return formatCurrentTime();
    }

    return new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(date);
}

function mapMessageItemToChatMessage(message: MessageItem, friendId: string): ChatMessage {
    return {
        id: message.id,
        friendId,
        sender: message.senderId === friendId ? "friend" : "me",
        text: message.content,
        time: formatMessageTime(message.createdAt),
        readAt: message.readAt,
        createdAt: message.createdAt,
    };
}

function compareChatMessageCursor(left: Pick<ChatMessage, "createdAt" | "id">, right: Pick<ReadMessageCursor, "createdAt" | "id">) {
    const createdAtCompare = left.createdAt.localeCompare(right.createdAt);

    if (createdAtCompare !== 0) {
        return createdAtCompare;
    }

    return left.id.localeCompare(right.id);
}

function applyReadCursor(messages: ChatMessage[], readCursor: ReadMessageCursor | null) {
    if (!readCursor) {
        return messages;
    }

    // 마지막 읽음 커서 이전의 내 메시지 readAt 을 한 번에 보정합니다.
    return messages.map((message) => message.sender === "me" && compareChatMessageCursor(message, readCursor) <= 0
        ? { ...message, readAt: message.readAt ?? readCursor.readAt }
        : message);
}

function mapMessagesListResponseToChatMessages(response: MessagesListResponse, friendId: string) {
    return applyReadCursor(
        response.messages.map((message) => mapMessageItemToChatMessage(message, friendId)),
        response.lastReadOwnMessage,
    );
}

function mergeChatMessages(currentMessages: ChatMessage[], nextMessages: ChatMessage[]) {
    const mergedById = new Map<string, ChatMessage>();

    for (const message of currentMessages) {
        mergedById.set(message.id, message);
    }

    for (const message of nextMessages) {
        mergedById.set(message.id, message);
    }

    return [...mergedById.values()].sort((left, right) => {
        const createdAtCompare = left.createdAt.localeCompare(right.createdAt);

        if (createdAtCompare !== 0) {
            return createdAtCompare;
        }

        return left.id.localeCompare(right.id);
    });
}

function mergeMessagesListResponseWithCurrentMessages(input: {
    currentMessages: ChatMessage[];
    response: MessagesListResponse;
    friendId: string;
}) {
    const readAppliedCurrentMessages = applyReadCursor(input.currentMessages, input.response.lastReadOwnMessage);

    if (input.response.messages.length === 0) {
        return readAppliedCurrentMessages;
    }

    return mergeChatMessages(
        readAppliedCurrentMessages,
        mapMessagesListResponseToChatMessages(input.response, input.friendId),
    );
}

function buildMessageFeedStateFromMessagesResponse(input: {
    friendId: string;
    response: MessagesListResponse;
    hasOlderMessages: boolean;
    currentMessages?: ChatMessage[];
}) {
    // 초기 로드, polling, 더보기를 같은 정규화 경로로 합칩니다.
    const nextMessages = input.currentMessages
        ? mergeMessagesListResponseWithCurrentMessages({
            currentMessages: input.currentMessages,
            response: input.response,
            friendId: input.friendId,
        })
        : mapMessagesListResponseToChatMessages(input.response, input.friendId);

    return buildMessageFeedState(input.friendId, nextMessages, input.hasOlderMessages);
}

function resetUnreadCountForFriend(currentFriends: FriendItem[], friendId: string) {
    return currentFriends.map((friend) => friend.id === friendId
        ? { ...friend, unreadCount: 0 }
        : friend);
}

function buildMessagesRequestUrl(input: {
    friendId: string;
    limit: number;
    after?: string | null;
    afterId?: string | null;
    before?: string | null;
    beforeId?: string | null;
}) {
    const searchParams = new URLSearchParams({
        friendId: input.friendId,
        limit: String(input.limit),
    });

    if (input.after && input.afterId) {
        searchParams.set("after", input.after);
        searchParams.set("afterId", input.afterId);
    }

    if (input.before && input.beforeId) {
        searchParams.set("before", input.before);
        searchParams.set("beforeId", input.beforeId);
    }

    return `/api/messages?${searchParams.toString()}`;
}

function createEmptyMessageFeedState(friendId: string | null): MessageFeedState {
    return {
        friendId,
        items: [],
        newestCreatedAt: null,
        newestMessageId: null,
        oldestCreatedAt: null,
        oldestMessageId: null,
        hasOlderMessages: false,
    };
}

function buildMessageFeedState(
    friendId: string,
    items: ChatMessage[],
    hasOlderMessages: boolean,
): MessageFeedState {
    return {
        friendId,
        items,
        newestCreatedAt: items.at(-1)?.createdAt ?? null,
        newestMessageId: items.at(-1)?.id ?? null,
        oldestCreatedAt: items[0]?.createdAt ?? null,
        oldestMessageId: items[0]?.id ?? null,
        hasOlderMessages,
    };
}

export function useChatScreenMessageState({
    activeFriendId,
    setFeedbackMessage,
    setFriends,
}: UseChatScreenMessageStateArgs) {
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
    const [messageState, setMessageState] = useState<MessageFeedState>(createEmptyMessageFeedState(null));
    const [draftMessage, setDraftMessage] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function loadInitialMessages() {
            setIsLoadingOlderMessages(false);

            if (!activeFriendId) {
                setMessageState(createEmptyMessageFeedState(null));
                setIsLoadingMessages(false);
                return;
            }

            setIsLoadingMessages(true);
            setMessageState(createEmptyMessageFeedState(activeFriendId));

            try {
                const result = await requestApi<MessagesListResponse>(buildMessagesRequestUrl({
                    friendId: activeFriendId,
                    limit: MESSAGE_PAGE_SIZE,
                }), "메시지 목록을 불러오지 못했습니다.", {
                    method: "GET",
                    cache: "no-store",
                });

                if (!isMounted) {
                    return;
                }

                if (result.status === "unauthorized") {
                    window.location.href = "/login";
                    return;
                }

                if (result.status === "error") {
                    setMessageState(createEmptyMessageFeedState(activeFriendId));
                    setFeedbackMessage(result.message);
                    return;
                }

                setMessageState(buildMessageFeedStateFromMessagesResponse({
                    friendId: activeFriendId,
                    response: result.data,
                    hasOlderMessages: result.data.messages.length >= MESSAGE_PAGE_SIZE,
                }));
                setFriends((currentFriends) => resetUnreadCountForFriend(currentFriends, activeFriendId));
            } catch {
                if (!isMounted) {
                    return;
                }

                setMessageState(createEmptyMessageFeedState(activeFriendId));
                setFeedbackMessage("네트워크 오류로 메시지 목록을 불러오지 못했습니다.");
            } finally {
                if (isMounted) {
                    setIsLoadingMessages(false);
                }
            }
        }

        void loadInitialMessages();

        return () => {
            isMounted = false;
        };
    }, [activeFriendId, setFeedbackMessage, setFriends]);

    useEffect(() => {
        if (!activeFriendId || isLoadingMessages) {
            return;
        }

        let isMounted = true;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        async function pollMessages() {
            try {
                const result = await requestApi<MessagesListResponse>(buildMessagesRequestUrl({
                    friendId: activeFriendId,
                    limit: messageState.newestCreatedAt ? MESSAGE_PAGE_SIZE : 1,
                    after: messageState.newestCreatedAt,
                    afterId: messageState.newestMessageId,
                }), "메시지 목록을 불러오지 못했습니다.", {
                    method: "GET",
                    cache: "no-store",
                });

                if (!isMounted) {
                    return;
                }

                if (result.status === "unauthorized") {
                    window.location.href = "/login";
                    return;
                }

                if (result.status === "error") {
                    setFeedbackMessage(result.message);
                    return;
                }

                setMessageState((currentMessageState) => {
                    if (currentMessageState.friendId !== activeFriendId) {
                        return currentMessageState;
                    }

                    return buildMessageFeedStateFromMessagesResponse({
                        friendId: activeFriendId,
                        response: result.data,
                        hasOlderMessages: currentMessageState.hasOlderMessages,
                        currentMessages: currentMessageState.items,
                    });
                });
                setFriends((currentFriends) => resetUnreadCountForFriend(currentFriends, activeFriendId));
            } catch {
                if (!isMounted) {
                    return;
                }

                setFeedbackMessage("네트워크 오류로 메시지 목록을 불러오지 못했습니다.");
            } finally {
                if (isMounted) {
                    timeoutId = setTimeout(pollMessages, DEFAULT_MESSAGE_POLLING_INTERVAL_MS);
                }
            }
        }

        void pollMessages();

        return () => {
            isMounted = false;

            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [activeFriendId, isLoadingMessages, messageState.newestCreatedAt, messageState.newestMessageId, setFeedbackMessage, setFriends]);

    const selectedMessages = useMemo(
        () => (messageState.friendId === activeFriendId ? messageState.items : []),
        [activeFriendId, messageState.friendId, messageState.items],
    );
    const canLoadOlderMessages = messageState.friendId === activeFriendId && messageState.hasOlderMessages;

    function handleDraftMessageChange(nextValue: string) {
        setDraftMessage(nextValue);
        setFeedbackMessage(null);
    }

    async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const normalizedMessage = draftMessage.trim();

        if (!normalizedMessage) {
            setFeedbackMessage("메세지를 입력한 뒤 전송해 주세요.");
            return;
        }

        if (!activeFriendId) {
            setFeedbackMessage("메시지를 보낼 친구를 먼저 선택해 주세요.");
            return;
        }

        try {
            const result = await requestApi<MessageCreateResponse>("/api/messages", "메시지 전송 중 오류가 발생했습니다.", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    friendId: activeFriendId,
                    content: normalizedMessage,
                }),
            });

            if (result.status === "unauthorized") {
                window.location.href = "/login";
                return;
            }

            if (result.status === "error") {
                setFeedbackMessage(result.message);
                return;
            }

            const nextMessage = mapMessageItemToChatMessage(result.data.message, activeFriendId);

            setMessageState((currentMessageState) => {
                const currentItems = currentMessageState.friendId === activeFriendId ? currentMessageState.items : [];
                const nextMessages = mergeChatMessages(currentItems, [nextMessage]);
                return buildMessageFeedState(activeFriendId, nextMessages, currentMessageState.hasOlderMessages);
            });
            setDraftMessage("");
            setFeedbackMessage("메세지를 전송했어요.");
        } catch {
            setFeedbackMessage("네트워크 오류로 메시지를 전송하지 못했습니다.");
        }
    }

    async function handleLoadOlderMessages() {
        if (!activeFriendId || !messageState.oldestCreatedAt || !messageState.oldestMessageId || isLoadingOlderMessages || !messageState.hasOlderMessages) {
            return false;
        }

        setIsLoadingOlderMessages(true);

        try {
            const result = await requestApi<MessagesListResponse>(buildMessagesRequestUrl({
                friendId: activeFriendId,
                limit: MESSAGE_PAGE_SIZE,
                before: messageState.oldestCreatedAt,
                beforeId: messageState.oldestMessageId,
            }), "이전 메시지를 불러오지 못했습니다.", {
                method: "GET",
                cache: "no-store",
            });

            if (result.status === "unauthorized") {
                window.location.href = "/login";
                return false;
            }

            if (result.status === "error") {
                setFeedbackMessage(result.message);
                return false;
            }

            if (result.data.messages.length === 0) {
                setMessageState((currentMessageState) => currentMessageState.friendId === activeFriendId
                    ? { ...currentMessageState, hasOlderMessages: false }
                    : currentMessageState);
                return false;
            }

            setMessageState((currentMessageState) => {
                if (currentMessageState.friendId !== activeFriendId) {
                    return currentMessageState;
                }

                return buildMessageFeedStateFromMessagesResponse({
                    friendId: activeFriendId,
                    response: result.data,
                    hasOlderMessages: result.data.messages.length >= MESSAGE_PAGE_SIZE,
                    currentMessages: currentMessageState.items,
                });
            });

            return true;
        } catch {
            setFeedbackMessage("네트워크 오류로 이전 메시지를 불러오지 못했습니다.");
            return false;
        } finally {
            setIsLoadingOlderMessages(false);
        }
    }

    return {
        isLoadingMessages,
        isLoadingOlderMessages,
        selectedMessages,
        canLoadOlderMessages,
        draftMessage,
        handleDraftMessageChange,
        handleSendMessage,
        handleLoadOlderMessages,
    };
}