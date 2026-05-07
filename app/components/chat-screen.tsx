"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { ChatContent } from "./chat/chat-content";
import { buildRecommendationCards, initialChatMessages } from "./chat/data";
import type { ChatMessage } from "./chat/types";
import { initialFriends } from "./friends/data";
import { FriendsSidebar } from "./friends/friends-sidebar";

function formatCurrentTime() {
    return new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(new Date());
}

export function ChatScreen() {
    const searchParams = useSearchParams();
    const requestedFriendId = searchParams.get("friend");
    const [friendSearch, setFriendSearch] = useState("");
    const [selectedFriendId, setSelectedFriendId] = useState(initialFriends[0]?.id ?? "");
    const [messages, setMessages] = useState<ChatMessage[]>(initialChatMessages);
    const [draftMessage, setDraftMessage] = useState("");
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [sharedLocationTimestamps, setSharedLocationTimestamps] = useState<Record<string, string>>({
        "young-geol": "오전 10:10",
        "young-jun": "오후 01:05",
    });
    const [recommendedFriendIds, setRecommendedFriendIds] = useState<string[]>([]);
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
    const recommendationCards = useMemo(
        () => buildRecommendationCards(selectedFriend),
        [selectedFriend],
    );

    const myLocationStatus = lastSharedAt
        ? `내 위치를 ${lastSharedAt}에 공유했어요. 추천 정확도를 높일 준비가 됐어요.`
        : "아직 내 위치를 공유하지 않았어요. 위치 공유 후 추천을 시작할 수 있어요.";
    const friendLocationStatus = selectedFriend
        ? `${selectedFriend.nickname} 님은 ${selectedFriend.locationHint}`
        : "친구 위치 정보가 없어요.";

    function handleSendMessage(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const normalizedMessage = draftMessage.trim();

        if (!normalizedMessage) {
            setFeedbackMessage("메세지를 입력한 뒤 전송해 주세요.");
            return;
        }

        setMessages((currentMessages) => [
            ...currentMessages,
            {
                id: `${selectedFriendId}-${Date.now()}`,
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

    function handleRecommend() {
        setRecommendedFriendIds((currentFriendIds) => (
            currentFriendIds.includes(activeFriendId)
                ? currentFriendIds
                : [...currentFriendIds, activeFriendId]
        ));
        setFeedbackMessage(`${selectedFriend?.nickname ?? "친구"} 님 기준 추천 결과를 준비했어요.`);
    }

    return (
        <section className="flex min-h-[calc(100vh-72px)] flex-1 bg-[#eeebff] px-2.5 py-4 sm:px-5 sm:py-6 md:min-h-[calc(100vh-84px)] md:px-6 md:py-8 lg:px-8 lg:py-10 xl:px-10 xl:py-12">
            <div className="mx-auto grid w-full max-w-[1440px] gap-4 sm:gap-5 lg:min-h-full lg:grid-cols-[320px_minmax(0,1fr)] lg:items-stretch xl:grid-cols-[360px_minmax(0,1fr)] xl:gap-6">
                <FriendsSidebar
                    friendSearch={friendSearch}
                    onFriendSearchChange={setFriendSearch}
                    filteredFriends={filteredFriends}
                    selectedFriendId={activeFriendId}
                    onSelectFriend={(friendId) => {
                        setSelectedFriendId(friendId);
                        setFeedbackMessage(null);
                    }}
                    getFriendHref={(friendId) => `/chat?friend=${friendId}`}
                />

                <ChatContent
                    selectedFriend={selectedFriend}
                    messages={selectedMessages}
                    draftMessage={draftMessage}
                    onDraftMessageChange={(nextValue) => {
                        setDraftMessage(nextValue);
                        if (feedbackMessage) {
                            setFeedbackMessage(null);
                        }
                    }}
                    onSendMessage={handleSendMessage}
                    feedbackMessage={feedbackMessage}
                    myLocationStatus={myLocationStatus}
                    friendLocationStatus={friendLocationStatus}
                    lastSharedAt={lastSharedAt}
                    onShareLocation={handleShareLocation}
                    onRecommend={handleRecommend}
                    hasRecommendations={hasRecommendations}
                    recommendationCards={recommendationCards}
                />
            </div>
        </section>
    );
}