"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import type { ApiResponse } from "@/lib/contracts/api";
import type { FriendsListResponse, LocationShareScope } from "@/lib/contracts/friends";

import {
    buildBrowserSharedLocation,
    buildManualSharedLocation,
    buildStoredSharedLocation,
    getLocationShareCopy,
    getLocationShareGeolocationErrorMessage,
    getMissingLocationShareTargetMessage,
} from "./chat-location-share-helpers";
import {
    buildFriendLocationStatus,
    buildMyLocationStatus,
    formatCurrentTime,
    type SharedLocationState,
} from "./chat-screen-helpers";
import type { ChatMessage, ResolvedLocation } from "./types";
import type { FriendItem } from "../friends/types";
import { formatLocationUpdatedLabel, mapFriendSummaryToItem } from "../friends/mappers";
import { useRecommendationFlowState } from "./recommendation/use-recommendation-flow-state";

type MessageItem = {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    readAt: string | null;
    createdAt: string;
};

type ReadMessageCursor = {
    id: string;
    createdAt: string;
    readAt: string;
};

type MessagesListResponse = {
    messages: MessageItem[];
    lastMessageCreatedAt: string | null;
    lastReadOwnMessage: ReadMessageCursor | null;
    pollingIntervalSec: number;
};

type MessageCreateResponse = {
    message: MessageItem;
};

type LocationSaveResponse = {
    location: {
        lat: number;
        lng: number;
        locationUpdatedAt: string | null;
    };
    locationShareScope: LocationShareScope;
    locationShareTargetUserId: string | null;
};

type LocationLookupResponse = {
    location: {
        lat: number;
        lng: number;
        locationUpdatedAt: string | null;
    } | null;
    locationShareScope: LocationShareScope | null;
    locationShareTargetUserId: string | null;
};

type ApiRequestResult<T> =
    | { status: "ok"; data: T }
    | { status: "unauthorized" }
    | { status: "error"; message: string };

type ManualShareFallbackHandler = (scope: LocationShareScope) => void;

const DEFAULT_MESSAGE_POLLING_INTERVAL_MS = 5000;
const DEFAULT_FRIENDS_POLLING_INTERVAL_MS = 5000;
const MESSAGE_PAGE_SIZE = 100;

type MessageFeedState = {
    friendId: string | null;
    items: ChatMessage[];
    newestCreatedAt: string | null;
    newestMessageId: string | null;
    oldestCreatedAt: string | null;
    oldestMessageId: string | null;
    hasOlderMessages: boolean;
};

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

    // 마지막 읽음 커서 이전의 내 메시지 readAt 을 보정한다.
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
    // 초기 로드, polling, 더보기를 같은 정규화 경로로 합친다.
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

async function requestApi<T>(input: RequestInfo | URL, fallbackMessage: string, init?: RequestInit): Promise<ApiRequestResult<T>> {
    const response = await fetch(input, init);
    const payload = (await response.json()) as ApiResponse<T>;

    if (response.status === 401) {
        return { status: "unauthorized" };
    }

    if (!response.ok || !payload.ok) {
        return {
            status: "error",
            message: payload.ok ? fallbackMessage : payload.error.message,
        };
    }

    return {
        status: "ok",
        data: payload.data,
    };
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

export function useChatScreenState(requestedFriendId: string | null = null) {
    const [friends, setFriends] = useState<FriendItem[]>([]);
    const [isLoadingFriends, setIsLoadingFriends] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
    const [friendSearch, setFriendSearch] = useState("");
    const [selectedFriendId, setSelectedFriendId] = useState("");
    const [messageState, setMessageState] = useState<MessageFeedState>(createEmptyMessageFeedState(null));
    const [draftMessage, setDraftMessage] = useState("");
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [mySharedLocation, setMySharedLocation] = useState<SharedLocationState | null>(null);

    const effectiveSelectedFriendId = requestedFriendId && friends.some((friend) => friend.id === requestedFriendId)
        ? requestedFriendId
        : friends.some((friend) => friend.id === selectedFriendId)
            ? selectedFriendId
            : friends[0]?.id ?? "";

    const activeFriendId = effectiveSelectedFriendId;

    useEffect(() => {
        let isMounted = true;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        async function loadFriends() {
            try {
                const result = await requestApi<FriendsListResponse>("/api/friends", "친구 목록을 불러오지 못했습니다.", {
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
                    timeoutId = setTimeout(loadFriends, DEFAULT_FRIENDS_POLLING_INTERVAL_MS);
                    return;
                }

                setFriends(result.data.friends.map(mapFriendSummaryToItem));
                timeoutId = setTimeout(loadFriends, DEFAULT_FRIENDS_POLLING_INTERVAL_MS);
            } catch {
                if (!isMounted) {
                    return;
                }

                setFeedbackMessage("네트워크 오류로 친구 목록을 불러오지 못했습니다.");
                timeoutId = setTimeout(loadFriends, DEFAULT_FRIENDS_POLLING_INTERVAL_MS);
            } finally {
                if (isMounted) {
                    setIsLoadingFriends(false);
                }
            }
        }

        void loadFriends();

        return () => {
            isMounted = false;

            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function loadMyLocation() {
            try {
                const result = await requestApi<LocationLookupResponse>("/api/location", "위치 정보를 불러오지 못했습니다.", {
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
                    return;
                }

                if (!result.data.location) {
                    setMySharedLocation(null);
                    return;
                }

                setMySharedLocation({
                    ...buildStoredSharedLocation(result.data.location.lat, result.data.location.lng),
                    sharedAt: formatLocationUpdatedLabel(result.data.location.locationUpdatedAt) ?? "최근",
                    shareScope: result.data.locationShareScope,
                    sharedFriendId: result.data.locationShareTargetUserId,
                });
            } catch {
                if (!isMounted) {
                    return;
                }
            }
        }

        void loadMyLocation();

        return () => {
            isMounted = false;
        };
    }, []);

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

        if (activeFriendId) {
            void loadInitialMessages();
        }

        return () => {
            isMounted = false;
        };
    }, [activeFriendId]);

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
    }, [activeFriendId, isLoadingMessages, messageState.newestCreatedAt, messageState.newestMessageId]);

    const filteredFriends = useMemo(() => {
        const normalizedQuery = friendSearch.trim().toLowerCase();

        if (!normalizedQuery) {
            return friends;
        }

        return friends.filter((friend) => friend.nickname.toLowerCase().includes(normalizedQuery));
    }, [friendSearch, friends]);

    const selectedFriend = useMemo(
        () => friends.find((friend) => friend.id === activeFriendId) ?? friends[0] ?? null,
        [activeFriendId, friends],
    );

    const selectedMessages = useMemo(
        () => (messageState.friendId === activeFriendId ? messageState.items : []),
        [activeFriendId, messageState.friendId, messageState.items],
    );

    const myLocationForSelectedFriend = useMemo(() => {
        if (!mySharedLocation) {
            return null;
        }

        if (mySharedLocation.shareScope === "all_friends") {
            return mySharedLocation;
        }

        if (mySharedLocation.shareScope === "friend" && mySharedLocation.sharedFriendId === activeFriendId) {
            return mySharedLocation;
        }

        return null;
    }, [activeFriendId, mySharedLocation]);

    const lastSharedAt = mySharedLocation?.sharedAt ?? null;
    const {
        meetingMode,
        selectedCategory,
        departureInputMethod,
        departureSearchQueries,
        visibleSavedDepartures,
        selectedSavedDepartureIds,
        selectedDepartureLabels,
        recommendationSummary,
        canRecommend,
        hasMyLocationStatusData,
        hasFriendLocationStatusData,
        hasRecommendations,
        recommendationCards,
        mapMarkers,
        handleMeetingModeChange,
        handleCategoryChange,
        handleDepartureInputMethodChange,
        handleDepartureSearchQueryChange,
        handlePinnedDepartureSelect,
        handleSavedDepartureSelect,
        handleDeleteSavedDeparture,
        handleDeleteAllSavedDepartures,
        handleUpdateSavedDeparture,
        handleCreateSavedDeparture,
        handleRecommend,
    } = useRecommendationFlowState({
        activeFriendId,
        mySharedLocation: myLocationForSelectedFriend,
        selectedFriend,
        setFeedbackMessage,
    });

    const myLocationStatus = buildMyLocationStatus(mySharedLocation, selectedFriend);
    const friendLocationStatus = buildFriendLocationStatus(selectedFriend);

    function handleSelectFriend(friendId: string) {
        setSelectedFriendId(friendId);
        setFeedbackMessage(null);
    }

    function handleDraftMessageChange(nextValue: string) {
        setDraftMessage(nextValue);

        if (feedbackMessage) {
            setFeedbackMessage(null);
        }
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

    function commitSharedLocation(input: {
        nextLocation: ResolvedLocation;
        feedbackLabel: string;
        locationShareScope: LocationShareScope;
        locationShareTargetUserId: string | null;
    }) {
        const nextTimestamp = formatCurrentTime();

        setMySharedLocation({
            ...input.nextLocation,
            sharedAt: nextTimestamp,
            shareScope: input.locationShareScope,
            sharedFriendId: input.locationShareTargetUserId,
        });
        setFeedbackMessage(`${input.feedbackLabel} ${nextTimestamp}에 반영했어요.`);
    }

    async function persistSharedLocation(scope: LocationShareScope, nextLocation: ResolvedLocation) {
        const missingTargetMessage = getMissingLocationShareTargetMessage(scope, activeFriendId);

        if (missingTargetMessage) {
            setFeedbackMessage(missingTargetMessage);
            return false;
        }

        const shareCopy = getLocationShareCopy(scope);

        try {
            const result = await requestApi<LocationSaveResponse>("/api/location", "위치 저장 중 오류가 발생했습니다.", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    lat: nextLocation.latitude,
                    lng: nextLocation.longitude,
                    scope,
                    friendId: scope === "friend" ? activeFriendId : null,
                }),
            });

            if (result.status === "unauthorized") {
                window.location.href = "/login";
                return false;
            }

            if (result.status === "error") {
                setFeedbackMessage(result.message);
                return false;
            }

            commitSharedLocation({
                nextLocation,
                feedbackLabel: shareCopy.successLabel,
                locationShareScope: result.data.locationShareScope,
                locationShareTargetUserId: result.data.locationShareTargetUserId,
            });
            return true;
        } catch {
            setFeedbackMessage("네트워크 오류로 위치를 저장하지 못했습니다.");
            return false;
        }
    }

    function shareLocation(scope: LocationShareScope, onManualShareFallback?: ManualShareFallbackHandler) {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
            setFeedbackMessage("브라우저에서 위치 정보를 지원하지 않아 지도에서 직접 위치를 지정해 주세요.");
            onManualShareFallback?.(scope);
            return;
        }

        const missingTargetMessage = getMissingLocationShareTargetMessage(scope, activeFriendId);

        if (missingTargetMessage) {
            setFeedbackMessage(missingTargetMessage);
            return;
        }

        const shareCopy = getLocationShareCopy(scope);

        setFeedbackMessage(shareCopy.checkingMessage);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                await persistSharedLocation(scope, buildBrowserSharedLocation(position.coords.latitude, position.coords.longitude));
            },
            (error) => {
                setFeedbackMessage(getLocationShareGeolocationErrorMessage(error.code));
                onManualShareFallback?.(scope);
            },
            {
                enableHighAccuracy: true,
                timeout: 8000,
                maximumAge: 0,
            },
        );
    }

    function handleShareLocationToFriend(onManualShareFallback?: ManualShareFallbackHandler) {
        shareLocation("friend", onManualShareFallback);
    }

    function handleShareLocationToAllFriends(onManualShareFallback?: ManualShareFallbackHandler) {
        shareLocation("all_friends", onManualShareFallback);
    }

    async function handleShareResolvedLocation(scope: LocationShareScope, location: ResolvedLocation) {
        setFeedbackMessage(getLocationShareCopy(scope).manualShareMessage);

        return persistSharedLocation(scope, buildManualSharedLocation(location));
    }

    return {
        isLoadingFriends,
        isLoadingMessages,
        isLoadingOlderMessages,
        friendSearch,
        setFriendSearch,
        activeFriendId,
        filteredFriends,
        selectedFriend,
        selectedMessages,
        canLoadOlderMessages: messageState.friendId === activeFriendId && messageState.hasOlderMessages,
        draftMessage,
        feedbackMessage,
        myLocationStatus,
        friendLocationStatus,
        mySharedLocation,
        lastSharedAt,
        meetingMode,
        selectedCategory,
        departureInputMethod,
        departureSearchQueries,
        visibleSavedDepartures,
        selectedSavedDepartureIds,
        selectedDepartureLabels,
        recommendationSummary,
        canRecommend,
        hasMyLocationStatusData,
        hasFriendLocationStatusData,
        hasRecommendations,
        recommendationCards,
        mapMarkers,
        handleSelectFriend,
        handleDraftMessageChange,
        handleSendMessage,
        handleLoadOlderMessages,
        handleShareLocationToFriend,
        handleShareLocationToAllFriends,
        handleShareResolvedLocation,
        handleMeetingModeChange,
        handleCategoryChange,
        handleDepartureInputMethodChange,
        handleDepartureSearchQueryChange,
        handlePinnedDepartureSelect,
        handleSavedDepartureSelect,
        handleDeleteSavedDeparture,
        handleDeleteAllSavedDepartures,
        handleUpdateSavedDeparture,
        handleCreateSavedDeparture,
        handleRecommend,
    };
}
