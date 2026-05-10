"use client";

import { ChatContent } from "./chat/chat-content";
import { useChatScreenState } from "./chat/use-chat-screen-state";
import { FriendsSidebar } from "./friends/friends-sidebar";

type ChatScreenProps = {
    requestedFriendId?: string | null;
};

export function ChatScreen({ requestedFriendId = null }: ChatScreenProps) {
    const {
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
        savedDepartures,
        isSavedDepartureEmptyPreview,
        selectedSavedDepartureId,
        selectedDepartureLabel,
        recommendationSummary,
        canRecommend,
        recommendationViewState,
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
        handleRecommendationViewStatePreview,
        handleRecommend,
    } = useChatScreenState(requestedFriendId);

    return (
        <section className="flex min-h-[calc(100vh-72px)] flex-1 bg-[#eeebff] px-2.5 py-4 sm:px-5 sm:py-6 md:min-h-[calc(100vh-84px)] md:px-6 md:py-8 lg:px-8 lg:py-10 xl:px-10 xl:py-12">
            <div className="mx-auto grid w-full max-w-[1440px] gap-4 sm:gap-5 lg:min-h-full lg:grid-cols-[320px_minmax(0,1fr)] lg:items-stretch xl:grid-cols-[360px_minmax(0,1fr)] xl:gap-6">
                <FriendsSidebar
                    friendSearch={friendSearch}
                    onFriendSearchChange={setFriendSearch}
                    filteredFriends={filteredFriends}
                    selectedFriendId={activeFriendId}
                    onSelectFriend={handleSelectFriend}
                    getFriendHref={(friendId) => `/chat?friend=${friendId}`}
                />

                <ChatContent
                    selectedFriend={selectedFriend}
                    messages={selectedMessages}
                    draftMessage={draftMessage}
                    onDraftMessageChange={handleDraftMessageChange}
                    onSendMessage={handleSendMessage}
                    feedbackMessage={feedbackMessage}
                    myLocationStatus={myLocationStatus}
                    friendLocationStatus={friendLocationStatus}
                    lastSharedAt={lastSharedAt}
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
                    onShareLocation={handleShareLocation}
                    onMeetingModeChange={handleMeetingModeChange}
                    onCategoryChange={handleCategoryChange}
                    onDepartureInputMethodChange={handleDepartureInputMethodChange}
                    onDepartureSearchQueryChange={handleDepartureSearchQueryChange}
                    onPinnedDepartureSelect={handlePinnedDepartureSelect}
                    onSavedDepartureSelect={handleSavedDepartureSelect}
                    onSavedDepartureEmptyPreviewToggle={handleSavedDepartureEmptyPreviewToggle}
                    onRecommendationViewStatePreview={handleRecommendationViewStatePreview}
                    onRecommend={handleRecommend}
                    hasRecommendations={hasRecommendations}
                    recommendationCards={recommendationCards}
                />
            </div>
        </section>
    );
}