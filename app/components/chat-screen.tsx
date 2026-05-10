"use client";

import { useEffect, useRef, useState } from "react";

import { ChatConversationPanel } from "./chat/chat-conversation-panel";
import { ChatHeaderCard } from "./chat/chat-header-card";
import { ChatLocationStatusPanel } from "./chat/chat-location-status-panel";
import { ChatRecommendationPanels } from "./chat/chat-recommendation-panels";
import { ChatSaveLocationLayer } from "./chat/chat-save-location-layer";
import { useChatScreenState } from "./chat/use-chat-screen-state";
import type { DepartureParty } from "./chat/types";
import { FriendsSidebar } from "./friends/friends-sidebar";

type ChatScreenProps = {
    requestedFriendId?: string | null;
};

type PendingLocationSave = {
    party: DepartureParty;
    previewValue: string;
    sourceLabel: string;
    title: string;
};

export function ChatScreen({ requestedFriendId = null }: ChatScreenProps) {
    const topPanelsRef = useRef<HTMLDivElement | null>(null);
    const sidebarPanelRef = useRef<HTMLDivElement | null>(null);
    const [pendingLocationSave, setPendingLocationSave] = useState<PendingLocationSave | null>(null);
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
    } = useChatScreenState(requestedFriendId);

    function handleOpenSaveLocationLayer(party: DepartureParty, previewValue: string, sourceLabel: string) {
        setPendingLocationSave({
            party,
            previewValue,
            sourceLabel,
            title: party === "me" ? "내 위치 저장" : "친구 위치 저장",
        });
    }

    function handleCloseSaveLocationLayer() {
        setPendingLocationSave(null);
    }

    function handleConfirmSaveLocation(nextTitle: string) {
        if (!pendingLocationSave) {
            return;
        }

        const didSave = handleCreateSavedDeparture(
            pendingLocationSave.party,
            nextTitle,
            pendingLocationSave.previewValue,
            pendingLocationSave.sourceLabel,
        );

        if (didSave) {
            setPendingLocationSave(null);
        }
    }

    useEffect(() => {
        const topPanelsElement = topPanelsRef.current;

        if (!topPanelsElement) {
            return;
        }

        const updateHeight = () => {
            const nextHeight = `${topPanelsElement.getBoundingClientRect().height}px`;
            sidebarPanelRef.current?.style.setProperty("--friends-panel-height", nextHeight);
        };

        updateHeight();

        const resizeObserver = new ResizeObserver(() => {
            updateHeight();
        });

        resizeObserver.observe(topPanelsElement);

        return () => {
            resizeObserver.disconnect();
        };
    }, [selectedFriend, selectedMessages.length, feedbackMessage, myLocationStatus, friendLocationStatus, lastSharedAt]);

    return (
        <section className="flex min-h-[calc(100vh-72px)] flex-1 bg-[#eeebff] px-2.5 py-4 sm:px-5 sm:py-6 md:min-h-[calc(100vh-84px)] md:px-6 md:py-8 lg:px-8 lg:py-10 xl:px-10 xl:py-12">
            <div className="mx-auto grid w-full max-w-360 gap-4 sm:gap-5 xl:gap-6">
                <div className="grid gap-4 sm:gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start xl:grid-cols-[360px_minmax(0,1fr)] xl:gap-6">
                    <div ref={sidebarPanelRef} className="lg:h-(--friends-panel-height) lg:min-h-0">
                        <FriendsSidebar
                            friendSearch={friendSearch}
                            onFriendSearchChange={setFriendSearch}
                            filteredFriends={filteredFriends}
                            selectedFriendId={activeFriendId}
                            onSelectFriend={handleSelectFriend}
                            getFriendHref={(friendId) => `/chat?friend=${friendId}`}
                        />
                    </div>

                    {selectedFriend ? (
                        <div ref={topPanelsRef} className="grid gap-4 sm:gap-5 xl:gap-6">
                            <ChatHeaderCard selectedFriend={selectedFriend} lastSharedAt={lastSharedAt} />

                            <ChatConversationPanel
                                selectedFriend={selectedFriend}
                                messages={selectedMessages}
                                draftMessage={draftMessage}
                                onDraftMessageChange={handleDraftMessageChange}
                                onSendMessage={handleSendMessage}
                                feedbackMessage={feedbackMessage}
                            />

                            <ChatLocationStatusPanel
                                myLocationStatus={myLocationStatus}
                                friendLocationStatus={friendLocationStatus}
                                canSaveMyLocation={hasMyLocationStatusData}
                                canSaveFriendLocation={hasFriendLocationStatusData}
                                onShareLocation={handleShareLocation}
                                onOpenSaveLocationLayer={handleOpenSaveLocationLayer}
                            />
                        </div>
                    ) : null}
                </div>

                {selectedFriend ? (
                    <ChatRecommendationPanels
                        meetingMode={meetingMode}
                        selectedCategory={selectedCategory}
                        departureInputMethod={departureInputMethod}
                        departureSearchQueries={departureSearchQueries}
                        visibleSavedDepartures={visibleSavedDepartures}
                        isSavedDepartureEmptyPreview={isSavedDepartureEmptyPreview}
                        selectedSavedDepartureIds={selectedSavedDepartureIds}
                        selectedDepartureLabels={selectedDepartureLabels}
                        selectedFriendName={selectedFriend.nickname}
                        recommendationSummary={recommendationSummary}
                        canRecommend={canRecommend}
                        onMeetingModeChange={handleMeetingModeChange}
                        onCategoryChange={handleCategoryChange}
                        onDepartureInputMethodChange={handleDepartureInputMethodChange}
                        onDepartureSearchQueryChange={handleDepartureSearchQueryChange}
                        onOpenSaveLocationLayer={handleOpenSaveLocationLayer}
                        onPinnedDepartureSelect={handlePinnedDepartureSelect}
                        onSavedDepartureSelect={handleSavedDepartureSelect}
                        onSavedDepartureEmptyPreviewToggle={handleSavedDepartureEmptyPreviewToggle}
                        onRecommend={handleRecommend}
                        hasRecommendations={hasRecommendations}
                        recommendationCards={recommendationCards}
                    />
                ) : null}

                {pendingLocationSave ? (
                    <ChatSaveLocationLayer
                        key={`${pendingLocationSave.party}:${pendingLocationSave.sourceLabel}:${pendingLocationSave.previewValue}`}
                        title={pendingLocationSave.title}
                        sourceLabel={pendingLocationSave.sourceLabel}
                        previewValue={pendingLocationSave.previewValue}
                        onClose={handleCloseSaveLocationLayer}
                        onConfirm={handleConfirmSaveLocation}
                    />
                ) : null}
            </div>
        </section>
    );
}