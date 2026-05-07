import type { FormEvent } from "react";

import type { FriendItem } from "../friends/types";
import type { ChatMessage, RecommendationCard } from "./types";
import { ChatConversationPanel } from "./chat-conversation-panel";
import { ChatHeaderCard } from "./chat-header-card";
import { ChatStatusPanels } from "./chat-status-panels";

type ChatContentProps = {
    selectedFriend: FriendItem | null;
    messages: ChatMessage[];
    draftMessage: string;
    onDraftMessageChange: (nextValue: string) => void;
    onSendMessage: (event: FormEvent<HTMLFormElement>) => void;
    feedbackMessage: string | null;
    myLocationStatus: string;
    friendLocationStatus: string;
    lastSharedAt: string | null;
    onShareLocation: () => void;
    onRecommend: () => void;
    hasRecommendations: boolean;
    recommendationCards: RecommendationCard[];
};

export function ChatContent({
    selectedFriend,
    messages,
    draftMessage,
    onDraftMessageChange,
    onSendMessage,
    feedbackMessage,
    myLocationStatus,
    friendLocationStatus,
    lastSharedAt,
    onShareLocation,
    onRecommend,
    hasRecommendations,
    recommendationCards,
}: ChatContentProps) {
    if (!selectedFriend) {
        return null;
    }

    return (
        <div className="grid gap-4 sm:gap-5 xl:gap-6">
            <ChatHeaderCard selectedFriend={selectedFriend} lastSharedAt={lastSharedAt} />

            <ChatConversationPanel
                selectedFriend={selectedFriend}
                messages={messages}
                draftMessage={draftMessage}
                onDraftMessageChange={onDraftMessageChange}
                onSendMessage={onSendMessage}
                feedbackMessage={feedbackMessage}
            />

            <ChatStatusPanels
                myLocationStatus={myLocationStatus}
                friendLocationStatus={friendLocationStatus}
                onShareLocation={onShareLocation}
                onRecommend={onRecommend}
                hasRecommendations={hasRecommendations}
                recommendationCards={recommendationCards}
            />
        </div>
    );
}