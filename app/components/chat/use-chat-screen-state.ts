"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import { initialFriends } from "../friends/data";
import { buildRecommendationCards, buildRecommendationSummary, initialChatMessages } from "./data";
import type {
    ChatMessage,
    DepartureSearchResult,
    DepartureInputMethod,
    MeetingMode,
    RecommendationViewState,
    RecommendationCategory,
    SavedDeparture,
} from "./types";

const initialSharedLocationTimestamps: Record<string, string> = {
    "young-geol": "오전 10:10",
    "young-jun": "오후 01:05",
};

const initialSavedDepartures: SavedDeparture[] = [
    {
        id: "home",
        label: "우리집",
        description: "최근 사용 · 건대입구역 도보 8분",
        locationKind: "recent",
    },
    {
        id: "office",
        label: "사무실",
        description: "프리셋 · 선릉역 4번 출구",
        locationKind: "preset",
    },
    {
        id: "campus",
        label: "학교 정문",
        description: "프리셋 · 왕십리역 환승 기준",
        locationKind: "preset",
    },
];

const mockDepartureSearchResults: DepartureSearchResult[] = [
    {
        id: "konkuk-gate-2",
        label: "건대입구역 2번 출구",
        description: "지하철 출구 기준 · 도보 약속에 자주 쓰는 출발 위치",
    },
    {
        id: "seongsu-exit-3",
        label: "성수역 3번 출구",
        description: "지도 핀 없이 빠르게 선택하는 역 출발 위치",
    },
    {
        id: "wangsimni-square",
        label: "왕십리역 광장",
        description: "환승 기준으로 만나기 좋은 대표 위치",
    },
];

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
    const [recommendedFriendIds, setRecommendedFriendIds] = useState<string[]>([]);
    const [meetingMode, setMeetingMode] = useState<MeetingMode>("now");
    const [selectedCategory, setSelectedCategory] = useState<RecommendationCategory>("cafe");
    const [departureInputMethod, setDepartureInputMethod] = useState<DepartureInputMethod>("search");
    const [departureSearchQuery, setDepartureSearchQuery] = useState("건대입구역 2번 출구");
    const [selectedSavedDepartureId, setSelectedSavedDepartureId] = useState(initialSavedDepartures[0]?.id ?? "");
    const [pinnedDepartureLabel, setPinnedDepartureLabel] = useState("");
    const [recommendationViewState, setRecommendationViewState] = useState<RecommendationViewState>("idle");
    const [isSavedDepartureEmptyPreview, setIsSavedDepartureEmptyPreview] = useState(false);

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

    const hasRecommendations = recommendedFriendIds.includes(activeFriendId);
    const lastSharedAt = sharedLocationTimestamps[activeFriendId] ?? null;
    const availableSavedDepartures = isSavedDepartureEmptyPreview ? [] : initialSavedDepartures;
    const selectedSavedDeparture = availableSavedDepartures.find((departure) => departure.id === selectedSavedDepartureId) ?? null;
    const normalizedDepartureSearchQuery = departureSearchQuery.trim().toLowerCase();
    const departureSearchResults = useMemo(
        () => mockDepartureSearchResults.filter((result) => result.label.toLowerCase().includes(normalizedDepartureSearchQuery)),
        [normalizedDepartureSearchQuery],
    );
    const departureSearchState: "idle" | "results" | "empty" = normalizedDepartureSearchQuery.length === 0
        ? "idle"
        : departureSearchResults.length > 0
            ? "results"
            : "empty";
    const selectedDepartureLabel = meetingMode === "later"
        ? (() => {
            if (departureInputMethod === "search") {
                const normalizedQuery = departureSearchQuery.trim();
                return normalizedQuery ? `${normalizedQuery} 검색 위치` : null;
            }

            if (departureInputMethod === "pin") {
                return pinnedDepartureLabel || null;
            }

            return selectedSavedDeparture?.label ?? null;
        })()
        : null;
    const recommendationCards = useMemo(
        () => buildRecommendationCards(selectedFriend, selectedCategory),
        [selectedFriend, selectedCategory],
    );
    const recommendationSummary = useMemo(
        () => buildRecommendationSummary(selectedFriend, meetingMode, selectedCategory, selectedDepartureLabel),
        [meetingMode, selectedCategory, selectedDepartureLabel, selectedFriend],
    );
    const canRecommend = meetingMode === "now" ? Boolean(lastSharedAt) : Boolean(selectedDepartureLabel);
    const hasRecommendationResults = recommendationViewState === "results" && hasRecommendations;

    const myLocationStatus = lastSharedAt
        ? `내 위치를 ${lastSharedAt}에 공유했어요. 추천 정확도를 높일 준비가 됐어요.`
        : "아직 내 위치를 공유하지 않았어요. 위치 공유 후 추천을 시작할 수 있어요.";
    const friendLocationStatus = selectedFriend
        ? `${selectedFriend.nickname} 님은 ${selectedFriend.locationHint}`
        : "친구 위치 정보가 없어요.";

    function handleSelectFriend(friendId: string) {
        setSelectedFriendId(friendId);
        setFeedbackMessage(null);
        setRecommendationViewState("idle");
        setIsSavedDepartureEmptyPreview(false);
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

    function handleMeetingModeChange(nextMode: MeetingMode) {
        setMeetingMode(nextMode);
        setFeedbackMessage(null);
        setRecommendationViewState("idle");
    }

    function handleCategoryChange(nextCategory: RecommendationCategory) {
        setSelectedCategory(nextCategory);
        setFeedbackMessage(null);
    }

    function handleDepartureInputMethodChange(nextMethod: DepartureInputMethod) {
        setDepartureInputMethod(nextMethod);
        setFeedbackMessage(null);

        if (nextMethod !== "saved") {
            setIsSavedDepartureEmptyPreview(false);
        }
    }

    function handleDepartureSearchQueryChange(nextQuery: string) {
        setDepartureSearchQuery(nextQuery);
        setFeedbackMessage(null);
    }

    function handlePinnedDepartureSelect() {
        setDepartureInputMethod("pin");
        setPinnedDepartureLabel("지도 핀 위치 · 성수역 3번 출구 앞");
        setFeedbackMessage("지도에서 선택한 핀 위치를 출발 위치로 반영했어요.");
    }

    function handleSavedDepartureSelect(departureId: string) {
        setDepartureInputMethod("saved");
        setIsSavedDepartureEmptyPreview(false);
        setSelectedSavedDepartureId(departureId);
        setFeedbackMessage("저장된 출발 위치를 추천 기준으로 선택했어요.");
    }

    function handleSavedDepartureEmptyPreviewToggle() {
        setIsSavedDepartureEmptyPreview((currentValue) => {
            const nextValue = !currentValue;

            if (nextValue) {
                setSelectedSavedDepartureId("");
            } else {
                setSelectedSavedDepartureId(initialSavedDepartures[0]?.id ?? "");
            }

            return nextValue;
        });
        setFeedbackMessage(null);
    }

    function handleRecommendationViewStatePreview(nextState: RecommendationViewState) {
        setRecommendationViewState(nextState);
        setFeedbackMessage(null);

        if (nextState !== "results") {
            return;
        }

        setRecommendedFriendIds((currentFriendIds) => (
            currentFriendIds.includes(activeFriendId)
                ? currentFriendIds
                : [...currentFriendIds, activeFriendId]
        ));
    }

    function handleRecommend() {
        if (meetingMode === "now" && !lastSharedAt) {
            setFeedbackMessage("지금 만나기에서는 위치 공유 후 추천을 시작해 주세요.");
            return;
        }

        if (meetingMode === "later" && !selectedDepartureLabel) {
            setFeedbackMessage("나중에 만나기에서는 출발 위치를 정한 뒤 추천을 시작해 주세요.");
            return;
        }

        setRecommendedFriendIds((currentFriendIds) => (
            currentFriendIds.includes(activeFriendId)
                ? currentFriendIds
                : [...currentFriendIds, activeFriendId]
        ));
        setRecommendationViewState("results");
        setFeedbackMessage(`${selectedFriend?.nickname ?? "친구"} 님 기준 ${recommendationSummary.modeLabel} 추천 결과를 준비했어요.`);
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
        departureSearchQuery,
        departureSearchState,
        departureSearchResults,
        savedDepartures: availableSavedDepartures,
        isSavedDepartureEmptyPreview,
        selectedSavedDepartureId,
        selectedDepartureLabel,
        recommendationSummary,
        canRecommend,
        recommendationViewState,
        hasRecommendations: hasRecommendationResults,
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
        handleRecommendationViewStatePreview,
        handleRecommend,
    };
}