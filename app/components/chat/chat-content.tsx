import type { FormEvent } from "react";

import type { FriendItem } from "../friends/types";
import type {
    ChatMessage,
    DepartureSearchResult,
    DepartureInputMethod,
    MeetingMode,
    RecommendationCard,
    RecommendationCategory,
    RecommendationSummary,
    RecommendationViewState,
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
    departureSearchState: "idle" | "results" | "empty";
    departureSearchResults: DepartureSearchResult[];
    savedDepartures: SavedDeparture[];
    isSavedDepartureEmptyPreview: boolean;
    selectedSavedDepartureId: string;
    selectedDepartureLabel: string | null;
    recommendationSummary: RecommendationSummary;
    canRecommend: boolean;
    recommendationViewState: RecommendationViewState;
    onShareLocation: () => void;
    onMeetingModeChange: (nextMode: MeetingMode) => void;
    onCategoryChange: (nextCategory: RecommendationCategory) => void;
    onDepartureInputMethodChange: (nextMethod: DepartureInputMethod) => void;
    onDepartureSearchQueryChange: (nextQuery: string) => void;
    onPinnedDepartureSelect: () => void;
    onSavedDepartureSelect: (departureId: string) => void;
    onSavedDepartureEmptyPreviewToggle: () => void;
    onRecommendationViewStatePreview: (nextState: RecommendationViewState) => void;
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
    departureSearchState,
    departureSearchResults,
    savedDepartures,
    isSavedDepartureEmptyPreview,
    selectedSavedDepartureId,
    selectedDepartureLabel,
    recommendationSummary,
    canRecommend,
    recommendationViewState,
    onShareLocation,
    onMeetingModeChange,
    onCategoryChange,
    onDepartureInputMethodChange,
    onDepartureSearchQueryChange,
    onPinnedDepartureSelect,
    onSavedDepartureSelect,
    onSavedDepartureEmptyPreviewToggle,
    onRecommendationViewStatePreview,
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
                departureSearchState={departureSearchState}
                departureSearchResults={departureSearchResults}
                savedDepartures={savedDepartures}
                isSavedDepartureEmptyPreview={isSavedDepartureEmptyPreview}
                selectedSavedDepartureId={selectedSavedDepartureId}
                selectedDepartureLabel={selectedDepartureLabel}
                recommendationSummary={recommendationSummary}
                canRecommend={canRecommend}
                recommendationViewState={recommendationViewState}
                onMeetingModeChange={onMeetingModeChange}
                onCategoryChange={onCategoryChange}
                onDepartureInputMethodChange={onDepartureInputMethodChange}
                onDepartureSearchQueryChange={onDepartureSearchQueryChange}
                onPinnedDepartureSelect={onPinnedDepartureSelect}
                onSavedDepartureSelect={onSavedDepartureSelect}
                onSavedDepartureEmptyPreviewToggle={onSavedDepartureEmptyPreviewToggle}
                onRecommendationViewStatePreview={onRecommendationViewStatePreview}
                onRecommend={onRecommend}
                hasRecommendations={hasRecommendations}
                recommendationCards={recommendationCards}
            />
        </div>
    );
}