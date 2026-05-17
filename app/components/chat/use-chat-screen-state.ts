"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import type { ApiResponse } from "@/lib/contracts/api";
import type { FriendsListResponse } from "@/lib/contracts/friends";

import {
    buildFriendLocationStatus,
    buildMyLocationStatus,
    formatCurrentTime,
    type SharedLocationState,
} from "./chat-screen-helpers";
import { formatLocationPreview } from "./data";
import type { ChatMessage, ResolvedLocation } from "./types";
import type { FriendItem } from "../friends/types";
import { formatLocationUpdatedLabel, mapFriendSummaryToItem } from "../friends/mappers";
import { useRecommendationFlowState } from "./recommendation/use-recommendation-flow-state";

type MessageItem = {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
};

type MessagesListResponse = {
    messages: MessageItem[];
    lastMessageCreatedAt: string | null;
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
};

type LocationLookupResponse = {
    location: {
        lat: number;
        lng: number;
        locationUpdatedAt: string | null;
    } | null;
};

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
        createdAt: message.createdAt,
    };
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

    if (input.after) {
        searchParams.set("after", input.after);
        searchParams.set("afterId", input.afterId ?? "");
    }

    if (input.before) {
        searchParams.set("before", input.before);
        searchParams.set("beforeId", input.beforeId ?? "");
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
                const response = await fetch("/api/friends", {
                    method: "GET",
                    cache: "no-store",
                });
                const payload = (await response.json()) as ApiResponse<FriendsListResponse>;

                if (!isMounted) {
                    return;
                }

                if (response.status === 401) {
                    window.location.href = "/login";
                    return;
                }

                if (!response.ok || !payload.ok) {
                    setFeedbackMessage(payload.ok ? "친구 목록을 불러오지 못했습니다." : payload.error.message);
                    timeoutId = setTimeout(loadFriends, DEFAULT_FRIENDS_POLLING_INTERVAL_MS);
                    return;
                }

                setFriends(payload.data.friends.map(mapFriendSummaryToItem));
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
                const response = await fetch("/api/location", {
                    method: "GET",
                    cache: "no-store",
                });
                const payload = (await response.json()) as ApiResponse<LocationLookupResponse>;

                if (!isMounted) {
                    return;
                }

                if (response.status === 401) {
                    window.location.href = "/login";
                    return;
                }

                if (!response.ok || !payload.ok) {
                    return;
                }

                if (!payload.data.location) {
                    setMySharedLocation(null);
                    return;
                }

                setMySharedLocation({
                    label: "내 현재 위치",
                    address: `공유한 위치 · ${formatLocationPreview({
                        latitude: payload.data.location.lat,
                        longitude: payload.data.location.lng,
                    })}`,
                    latitude: payload.data.location.lat,
                    longitude: payload.data.location.lng,
                    sharedAt: formatLocationUpdatedLabel(payload.data.location.locationUpdatedAt) ?? "최근",
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
                const response = await fetch(buildMessagesRequestUrl({
                    friendId: activeFriendId,
                    limit: MESSAGE_PAGE_SIZE,
                }), {
                    method: "GET",
                    cache: "no-store",
                });
                const payload = (await response.json()) as ApiResponse<MessagesListResponse>;

                if (!isMounted) {
                    return;
                }

                if (response.status === 401) {
                    window.location.href = "/login";
                    return;
                }

                if (!response.ok || !payload.ok) {
                    setMessageState(createEmptyMessageFeedState(activeFriendId));
                    setFeedbackMessage(payload.ok ? "메시지 목록을 불러오지 못했습니다." : payload.error.message);
                    return;
                }

                const nextMessages = payload.data.messages.map((message) => mapMessageItemToChatMessage(message, activeFriendId));
                setMessageState(
                    buildMessageFeedState(activeFriendId, nextMessages, payload.data.messages.length >= MESSAGE_PAGE_SIZE),
                );
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
                const response = await fetch(buildMessagesRequestUrl({
                    friendId: activeFriendId,
                    limit: messageState.newestCreatedAt ? MESSAGE_PAGE_SIZE : 1,
                    after: messageState.newestCreatedAt,
                    afterId: messageState.newestMessageId,
                }), {
                    method: "GET",
                    cache: "no-store",
                });
                const payload = (await response.json()) as ApiResponse<MessagesListResponse>;

                if (!isMounted) {
                    return;
                }

                if (response.status === 401) {
                    window.location.href = "/login";
                    return;
                }

                if (!response.ok || !payload.ok) {
                    setFeedbackMessage(payload.ok ? "메시지 목록을 불러오지 못했습니다." : payload.error.message);
                    return;
                }

                if (payload.data.messages.length > 0) {
                    const incomingMessages = payload.data.messages.map((message) => mapMessageItemToChatMessage(message, activeFriendId));

                    setMessageState((currentMessageState) => {
                        if (currentMessageState.friendId !== activeFriendId) {
                            return currentMessageState;
                        }

                        const nextMessages = mergeChatMessages(currentMessageState.items, incomingMessages);
                        return buildMessageFeedState(activeFriendId, nextMessages, currentMessageState.hasOlderMessages);
                    });
                }
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
        mySharedLocation,
        selectedFriend,
        setFeedbackMessage,
    });

    const myLocationStatus = buildMyLocationStatus(mySharedLocation);
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
            const response = await fetch("/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    friendId: activeFriendId,
                    content: normalizedMessage,
                }),
            });
            const payload = (await response.json()) as ApiResponse<MessageCreateResponse>;

            if (response.status === 401) {
                window.location.href = "/login";
                return;
            }

            if (!response.ok || !payload.ok) {
                setFeedbackMessage(payload.ok ? "메시지 전송 중 오류가 발생했습니다." : payload.error.message);
                return;
            }

            const nextMessage = mapMessageItemToChatMessage(payload.data.message, activeFriendId);

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
            const response = await fetch(buildMessagesRequestUrl({
                friendId: activeFriendId,
                limit: MESSAGE_PAGE_SIZE,
                before: messageState.oldestCreatedAt,
                beforeId: messageState.oldestMessageId,
            }), {
                method: "GET",
                cache: "no-store",
            });
            const payload = (await response.json()) as ApiResponse<MessagesListResponse>;

            if (response.status === 401) {
                window.location.href = "/login";
                return false;
            }

            if (!response.ok || !payload.ok) {
                setFeedbackMessage(payload.ok ? "이전 메시지를 불러오지 못했습니다." : payload.error.message);
                return false;
            }

            if (payload.data.messages.length === 0) {
                setMessageState((currentMessageState) => currentMessageState.friendId === activeFriendId
                    ? { ...currentMessageState, hasOlderMessages: false }
                    : currentMessageState);
                return false;
            }

            const olderMessages = payload.data.messages.map((message) => mapMessageItemToChatMessage(message, activeFriendId));

            setMessageState((currentMessageState) => {
                if (currentMessageState.friendId !== activeFriendId) {
                    return currentMessageState;
                }

                const nextMessages = mergeChatMessages(currentMessageState.items, olderMessages);
                return buildMessageFeedState(
                    activeFriendId,
                    nextMessages,
                    payload.data.messages.length >= MESSAGE_PAGE_SIZE,
                );
            });

            return true;
        } catch {
            setFeedbackMessage("네트워크 오류로 이전 메시지를 불러오지 못했습니다.");
            return false;
        } finally {
            setIsLoadingOlderMessages(false);
        }
    }

    function commitSharedLocation(nextLocation: ResolvedLocation, feedbackLabel: string) {
        const nextTimestamp = formatCurrentTime();

        setMySharedLocation({
            ...nextLocation,
            sharedAt: nextTimestamp,
        });
        setFeedbackMessage(`${feedbackLabel} ${nextTimestamp}에 반영했어요.`);
    }

    function handleShareLocation() {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
            setFeedbackMessage("브라우저에서 위치 정보를 지원하지 않아요.");
            return;
        }

        setFeedbackMessage("브라우저 현재 위치를 확인하고 있어요.");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const response = await fetch("/api/location", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        }),
                    });
                    const payload = (await response.json()) as ApiResponse<LocationSaveResponse>;

                    if (response.status === 401) {
                        window.location.href = "/login";
                        return;
                    }

                    if (!response.ok || !payload.ok) {
                        setFeedbackMessage(payload.ok ? "위치 저장 중 오류가 발생했습니다." : payload.error.message);
                        return;
                    }

                    commitSharedLocation(
                        {
                            label: "내 현재 위치",
                            address: `브라우저 현재 위치 · ${formatLocationPreview({
                                latitude: payload.data.location.lat,
                                longitude: payload.data.location.lng,
                            })}`,
                            latitude: payload.data.location.lat,
                            longitude: payload.data.location.lng,
                        },
                        "현재 위치를",
                    );
                } catch {
                    setFeedbackMessage("네트워크 오류로 위치를 저장하지 못했습니다.");
                }
            },
            (error) => {
                setFeedbackMessage(
                    error.code === error.PERMISSION_DENIED
                        ? "위치 권한이 없어 현재 위치를 공유하지 못했어요."
                        : "정확한 위치를 읽지 못했어요. 잠시 후 다시 시도해 주세요.",
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 8000,
                maximumAge: 0,
            },
        );
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
        handleShareLocation,
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
