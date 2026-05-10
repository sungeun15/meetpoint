"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import { initialFriends } from "../friends/data";
import { initialChatMessages } from "./data";
import type { ChatMessage } from "./types";
import { useRecommendationFlowState } from "./use-recommendation-flow-state";

const initialSharedLocationTimestamps: Record<string, string> = {
    "young-geol": "오전 10:10",
    "young-jun": "오후 01:05",
};

function formatCurrentTime() {
    return new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(new Date());
}

export function useChatScreenState(requestedFriendId: string | null = null) {
    const [friendSearch, setFriendSearch] = useState("");
    const [selectedFriendId, setSelectedFriendId] = useState(initialFriends[0]?.id ?? "");
    const [messages, setMessages] = useState<ChatMessage[]>(initialChatMessages);
    const [draftMessage, setDraftMessage] = useState("");
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [sharedLocationTimestamps, setSharedLocationTimestamps] = useState<Record<string, string>>(initialSharedLocationTimestamps);

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

    const lastSharedAt = sharedLocationTimestamps[activeFriendId] ?? null;
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
        lastSharedAt,
        selectedFriend,
        setFeedbackMessage,
    });

    const myLocationStatus = lastSharedAt
        ? `내 위치를 ${lastSharedAt}에 공유했어요. 추천 정확도를 높일 준비가 됐어요.`
        : "아직 내 위치를 공유하지 않았어요. 위치 공유 후 추천을 시작할 수 있어요.";
    const friendLocationStatus = selectedFriend
        ? `${selectedFriend.nickname} 님은 ${selectedFriend.locationHint}`
        : "친구 위치 정보가 없어요.";

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
            {
                id: `${activeFriendId}-${Date.now()}`,
                friendId: activeFriendId,
                sender: "me",
                text: normalizedMessage,
                time: formatCurrentTime(),
            },
        ]);
        setDraftMessage("");
        setFeedbackMessage("메세지를 전송했어요.");
    }

    function handleShareLocation() {
        const nextTimestamp = formatCurrentTime();

        setSharedLocationTimestamps((currentTimestamps) => ({
            ...currentTimestamps,
            [activeFriendId]: nextTimestamp,
        }));
        setFeedbackMessage(`현재 위치를 ${nextTimestamp}에 공유했어요.`);
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
