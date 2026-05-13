"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import { initialFriends } from "../friends/data";
import {
    buildFriendLocationStatus,
    buildMyLocationStatus,
    buildOutgoingChatMessage,
    formatCurrentTime,
    resolveDemoSharedLocationFallback,
    type SharedLocationState,
} from "./chat-screen-helpers";
import { formatLocationPreview } from "./data";
import { initialChatMessages } from "./data";
import type { ChatMessage, ResolvedLocation } from "./types";
import { useRecommendationFlowState } from "./recommendation/use-recommendation-flow-state";

export function useChatScreenState(requestedFriendId: string | null = null) {
    const [friendSearch, setFriendSearch] = useState("");
    const [selectedFriendId, setSelectedFriendId] = useState(initialFriends[0]?.id ?? "");
    const [messages, setMessages] = useState<ChatMessage[]>(initialChatMessages);
    const [draftMessage, setDraftMessage] = useState("");
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [sharedLocations, setSharedLocations] = useState<Record<string, SharedLocationState>>({});

    const activeFriendId = initialFriends.some((friend) => friend.id === requestedFriendId)
        ? requestedFriendId ?? selectedFriendId
        : selectedFriendId;

    const filteredFriends = useMemo(() => {
        const normalizedQuery = friendSearch.trim().toLowerCase();

        if (!normalizedQuery) {
            return initialFriends;
        }

        return initialFriends.filter((friend) => friend.nickname.toLowerCase().includes(normalizedQuery));
    }, [friendSearch]);

    const selectedFriend = useMemo(
        () => initialFriends.find((friend) => friend.id === activeFriendId) ?? initialFriends[0] ?? null,
        [activeFriendId],
    );

    const selectedMessages = useMemo(
        () => messages.filter((message) => message.friendId === activeFriendId),
        [messages, activeFriendId],
    );

    const mySharedLocation = sharedLocations[activeFriendId] ?? null;
    const lastSharedAt = mySharedLocation?.sharedAt ?? null;
    const {
        meetingMode,
        selectedCategory,
        departureInputMethod,
        departureSearchQueries,
        visibleSavedDepartures,
        isSavedDepartureEmptyPreview,
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
        handleSavedDepartureEmptyPreviewToggle,
        handleCreateSavedDeparture,
        handleRecommend,
        resetSavedDeparturePreview,
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
        resetSavedDeparturePreview();
    }

    function handleDraftMessageChange(nextValue: string) {
        setDraftMessage(nextValue);

        if (feedbackMessage) {
            setFeedbackMessage(null);
        }
    }

    function handleSendMessage(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const normalizedMessage = draftMessage.trim();

        if (!normalizedMessage) {
            setFeedbackMessage("메세지를 입력한 뒤 전송해 주세요.");
            return;
        }

        setMessages((currentMessages) => [
            ...currentMessages,
            buildOutgoingChatMessage(activeFriendId, normalizedMessage),
        ]);
        setDraftMessage("");
        setFeedbackMessage("메세지를 전송했어요.");
    }

    function commitSharedLocation(nextLocation: ResolvedLocation, feedbackLabel: string) {
        const nextTimestamp = formatCurrentTime();

        setSharedLocations((currentLocations) => ({
            ...currentLocations,
            [activeFriendId]: {
                ...nextLocation,
                sharedAt: nextTimestamp,
            },
        }));
        setFeedbackMessage(`${feedbackLabel} ${nextTimestamp}에 반영했어요.`);
    }

    function handleShareLocation() {
        const fallbackLocation = resolveDemoSharedLocationFallback(activeFriendId);

        if (typeof navigator === "undefined" || !navigator.geolocation) {
            commitSharedLocation(fallbackLocation, "브라우저 위치를 읽지 못해 데모 좌표를");
            return;
        }

        setFeedbackMessage("브라우저 현재 위치를 확인하고 있어요.");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                commitSharedLocation(
                    {
                        label: "내 현재 위치",
                        address: `브라우저 현재 위치 · ${formatLocationPreview({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        })}`,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    },
                    "현재 위치를",
                );
            },
            (error) => {
                const errorPrefix = error.code === error.PERMISSION_DENIED
                    ? "위치 권한이 없어 데모 좌표를"
                    : "정확한 위치를 읽지 못해 데모 좌표를";
                commitSharedLocation(fallbackLocation, errorPrefix);
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
        lastSharedAt,
        meetingMode,
        selectedCategory,
        departureInputMethod,
        departureSearchQueries,
        visibleSavedDepartures,
        isSavedDepartureEmptyPreview,
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
        handleSavedDepartureEmptyPreviewToggle,
        handleCreateSavedDeparture,
        handleRecommend,
    };
}
