import type { FormEvent } from "react";

import type { FriendItem } from "../friends/types";
import type {
    ChatMessage,
    DepartureInputMethod,
    MeetingMode,
    RecommendationCard,
    RecommendationCategory,
    RecommendationSummary,
    SavedDeparture,
} from "./types";
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
    meetingMode: MeetingMode;
    selectedCategory: RecommendationCategory;
    departureInputMethod: DepartureInputMethod;
    departureSearchQuery: string;
    savedDepartures: SavedDeparture[];
    selectedSavedDepartureId: string;
    selectedDepartureLabel: string | null;
    recommendationSummary: RecommendationSummary;
    canRecommend: boolean;
    onShareLocation: () => void;
    onMeetingModeChange: (nextMode: MeetingMode) => void;
    onCategoryChange: (nextCategory: RecommendationCategory) => void;
    onDepartureInputMethodChange: (nextMethod: DepartureInputMethod) => void;
    onDepartureSearchQueryChange: (nextQuery: string) => void;
    onPinnedDepartureSelect: () => void;
    onSavedDepartureSelect: (departureId: string) => void;
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
    meetingMode,
    selectedCategory,
    departureInputMethod,
    departureSearchQuery,
    savedDepartures,
    selectedSavedDepartureId,
    selectedDepartureLabel,
    recommendationSummary,
    canRecommend,
    onShareLocation,
    onMeetingModeChange,
    onCategoryChange,
    onDepartureInputMethodChange,
    onDepartureSearchQueryChange,
    onPinnedDepartureSelect,
    onSavedDepartureSelect,
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
                meetingMode={meetingMode}
                selectedCategory={selectedCategory}
                departureInputMethod={departureInputMethod}
                departureSearchQuery={departureSearchQuery}
                savedDepartures={savedDepartures}
                selectedSavedDepartureId={selectedSavedDepartureId}
                selectedDepartureLabel={selectedDepartureLabel}
                recommendationSummary={recommendationSummary}
                canRecommend={canRecommend}
                onMeetingModeChange={onMeetingModeChange}
                onCategoryChange={onCategoryChange}
                onDepartureInputMethodChange={onDepartureInputMethodChange}
                onDepartureSearchQueryChange={onDepartureSearchQueryChange}
                onPinnedDepartureSelect={onPinnedDepartureSelect}
                onSavedDepartureSelect={onSavedDepartureSelect}
                onRecommend={onRecommend}
                hasRecommendations={hasRecommendations}
                recommendationCards={recommendationCards}
            />
        </div>
    );
}