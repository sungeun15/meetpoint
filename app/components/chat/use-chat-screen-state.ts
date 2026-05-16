"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import type { ApiResponse } from "@/lib/contracts/api";

import {
    buildFriendLocationStatus,
    buildMyLocationStatus,
    formatCurrentTime,
    type SharedLocationState,
} from "./chat-screen-helpers";
import { formatLocationPreview } from "./data";
import type { ChatMessage, ResolvedLocation } from "./types";
import type { FriendItem } from "../friends/types";
import { useRecommendationFlowState } from "./recommendation/use-recommendation-flow-state";

type FriendSummary = {
    id: string;
    relationId?: string;
    nickname: string;
    lat: number | null;
    lng: number | null;
    locationUpdatedAt: string | null;
};

type MessageItem = {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
};

type FriendsListResponse = {
    friends: FriendSummary[];
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

function formatLocationUpdatedLabel(locationUpdatedAt: string | null) {
    if (!locationUpdatedAt) {
        return null;
    }

    const date = new Date(locationUpdatedAt);

    if (Number.isNaN(date.getTime())) {
        return "최근";
    }

    return new Intl.DateTimeFormat("ko-KR", {
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(date);
}

function mapFriendSummaryToItem(friend: FriendSummary): FriendItem {
    const updatedLabel = formatLocationUpdatedLabel(friend.locationUpdatedAt);
    const latitude = friend.lat;
    const longitude = friend.lng;
    const hasLocation = latitude !== null && longitude !== null;

    return {
        id: friend.id,
        nickname: friend.nickname,
        status: hasLocation
            ? (updatedLabel ? `${updatedLabel} 위치를 공유했어요` : "최근 위치를 공유했어요")
            : "아직 위치를 공유하지 않았어요",
        locationHint: hasLocation
            ? `현재 저장된 좌표는 ${latitude.toFixed(5)}, ${longitude.toFixed(5)} 입니다.`
            : "위치 공유를 시작하면 chat 화면에서 좌표와 상태를 확인할 수 있어요.",
        locationSnapshot: hasLocation
            ? {
                address: `좌표 ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
                latitude,
                longitude,
                sharedAt: updatedLabel,
            }
            : undefined,
    };
}

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
    };
}

export function useChatScreenState(requestedFriendId: string | null = null) {
    const [friends, setFriends] = useState<FriendItem[]>([]);
    const [friendSearch, setFriendSearch] = useState("");
    const [selectedFriendId, setSelectedFriendId] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [draftMessage, setDraftMessage] = useState("");
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [mySharedLocation, setMySharedLocation] = useState<SharedLocationState | null>(null);

    const activeFriendId = friends.some((friend) => friend.id === requestedFriendId)
        ? requestedFriendId ?? selectedFriendId
        : selectedFriendId;

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
        if (!friends.length) {
            if (selectedFriendId) {
                setSelectedFriendId("");
            }
            return;
        }

        if (requestedFriendId && friends.some((friend) => friend.id === requestedFriendId)) {
            if (selectedFriendId !== requestedFriendId) {
                setSelectedFriendId(requestedFriendId);
            }
            return;
        }

        if (!friends.some((friend) => friend.id === selectedFriendId)) {
            setSelectedFriendId(friends[0]?.id ?? "");
        }
    }, [friends, requestedFriendId, selectedFriendId]);

    useEffect(() => {
        let isMounted = true;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        async function loadMessages() {
            if (!activeFriendId) {
                if (isMounted) {
                    setMessages([]);
                }
                return;
            }

            try {
                const response = await fetch(`/api/messages?friendId=${encodeURIComponent(activeFriendId)}`, {
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
                    timeoutId = setTimeout(loadMessages, DEFAULT_MESSAGE_POLLING_INTERVAL_MS);
                    return;
                }

                setMessages(payload.data.messages.map((message) => mapMessageItemToChatMessage(message, activeFriendId)));
                timeoutId = setTimeout(
                    loadMessages,
                    Math.max(payload.data.pollingIntervalSec * 1000, DEFAULT_MESSAGE_POLLING_INTERVAL_MS),
                );
            } catch {
                if (!isMounted) {
                    return;
                }

                setFeedbackMessage("네트워크 오류로 메시지 목록을 불러오지 못했습니다.");
                timeoutId = setTimeout(loadMessages, DEFAULT_MESSAGE_POLLING_INTERVAL_MS);
            }
        }

        if (activeFriendId) {
            setMessages([]);
            void loadMessages();
        } else {
            setMessages([]);
        }

        return () => {
            isMounted = false;

            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [activeFriendId]);

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

    const selectedMessages = useMemo(() => messages, [messages]);

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

            setMessages((currentMessages) => [
                ...currentMessages,
                mapMessageItemToChatMessage(payload.data.message, activeFriendId),
            ]);
            setDraftMessage("");
            setFeedbackMessage("메세지를 전송했어요.");
        } catch {
            setFeedbackMessage("네트워크 오류로 메시지를 전송하지 못했습니다.");
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
        friendSearch,
        setFriendSearch,
        activeFriendId,
        filteredFriends,
        selectedFriend,
        selectedMessages,
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
