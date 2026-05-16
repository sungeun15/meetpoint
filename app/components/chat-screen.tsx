"use client";

import { useEffect, useRef, useState } from "react";

import { ChatConversationPanel } from "./chat/chat-conversation-panel";
import { ChatHeaderCard } from "./chat/chat-header-card";
import { ChatLocationStatusPanel } from "./chat/chat-location-status-panel";
import { ChatRecommendationPanels } from "./chat/recommendation/chat-recommendation-panels";
import { ChatSaveLocationLayer } from "./chat/chat-save-location-layer";
import { useChatScreenState } from "./chat/use-chat-screen-state";
import type { DepartureParty, ResolvedLocation } from "./chat/types";
import { FriendsSidebar } from "./friends/friends-sidebar";

type ChatScreenProps = {
    requestedFriendId?: string | null;
};

type PendingLocationSave = {
    party: DepartureParty;
    previewValue: string;
    sourceLabel: string;
    title: string;
    resolvedLocation: ResolvedLocation | null;
    locationKind: "recent" | "preset";
};

export function ChatScreen({ requestedFriendId = null }: ChatScreenProps) {
    const topPanelsRef = useRef<HTMLDivElement | null>(null);
    const sidebarPanelRef = useRef<HTMLDivElement | null>(null);
    const [pendingLocationSave, setPendingLocationSave] = useState<PendingLocationSave | null>(null);
    const [isMobileSidebarCollapsed, setIsMobileSidebarCollapsed] = useState(true);
    const {
        isLoadingFriends,
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
    } = useChatScreenState(requestedFriendId);
    const friendLastSharedAt = selectedFriend?.locationSnapshot?.sharedAt ?? null;

    function handleOpenSaveLocationLayer(
        party: DepartureParty,
        previewValue: string,
        sourceLabel: string,
        resolvedLocation?: ResolvedLocation,
        locationKind: "recent" | "preset" = "preset",
    ) {
        setPendingLocationSave({
            party,
            previewValue,
            sourceLabel,
            title: party === "me" ? "내 위치 저장" : "친구 위치 저장",
            resolvedLocation: resolvedLocation ?? null,
            locationKind,
        });
    }

    function handleCloseSaveLocationLayer() {
        setPendingLocationSave(null);
    }

    async function handleConfirmSaveLocation(nextTitle: string) {
        if (!pendingLocationSave) {
            return;
        }

        const didSave = await handleCreateSavedDeparture(
            pendingLocationSave.party,
            nextTitle,
            pendingLocationSave.previewValue,
            pendingLocationSave.sourceLabel,
            pendingLocationSave.resolvedLocation,
            pendingLocationSave.locationKind,
        );

        if (didSave) {
            setPendingLocationSave(null);
        }
    }

    function handleToggleMobileSidebar() {
        setIsMobileSidebarCollapsed((currentValue) => !currentValue);
    }

    function handleSelectFriendAndCollapse(friendId: string) {
        handleSelectFriend(friendId);

        if (typeof window !== "undefined" && window.innerWidth < 1024) {
            setIsMobileSidebarCollapsed(true);
        }
    }

    useEffect(() => {
        const topPanelsElement = topPanelsRef.current;
        const sidebarPanelElement = sidebarPanelRef.current;

        if (!topPanelsElement || !sidebarPanelElement) {
            return;
        }

        const updateHeight = () => {
            if (window.innerWidth < 1280) {
                sidebarPanelElement.style.removeProperty("--friends-panel-height");
                return;
            }

            const nextHeight = `${topPanelsElement.getBoundingClientRect().height}px`;
            sidebarPanelElement.style.setProperty("--friends-panel-height", nextHeight);
        };

        updateHeight();

        const resizeObserver = new ResizeObserver(() => {
            updateHeight();
        });

        resizeObserver.observe(topPanelsElement);
        window.addEventListener("resize", updateHeight);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", updateHeight);
        };
    }, [selectedFriend, selectedMessages.length, feedbackMessage, myLocationStatus, friendLocationStatus, lastSharedAt]);

    useEffect(() => {
        const syncSidebarVisibility = () => {
            setIsMobileSidebarCollapsed(window.innerWidth < 1024);
        };

        syncSidebarVisibility();
        window.addEventListener("resize", syncSidebarVisibility);

        return () => {
            window.removeEventListener("resize", syncSidebarVisibility);
        };
    }, []);

    return (
        <section className="flex min-h-[calc(100vh-72px)] flex-1 overflow-x-hidden bg-[#eeebff] px-2.5 py-2.5 sm:px-4 sm:py-4 md:min-h-[calc(100vh-84px)] md:px-5 md:py-5 lg:px-6 lg:py-6 xl:px-7 xl:py-8">
            <div className="mx-auto grid min-w-0 w-full max-w-360 gap-2 sm:gap-3 xl:gap-4">
                <div className="grid min-w-0 gap-2.5 sm:gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start xl:grid-cols-[320px_minmax(0,1fr)] xl:gap-5">
                    <div ref={sidebarPanelRef} className="min-w-0 xl:h-(--friends-panel-height) xl:min-h-0">
                        <FriendsSidebar
                            isLoadingFriends={isLoadingFriends}
                            friendSearch={friendSearch}
                            onFriendSearchChange={setFriendSearch}
                            filteredFriends={filteredFriends}
                            selectedFriendId={activeFriendId}
                            selectedFriendName={selectedFriend?.nickname ?? null}
                            onSelectFriend={handleSelectFriendAndCollapse}
                            getFriendHref={(friendId) => `/chat?friend=${friendId}`}
                            isCollapsible
                            isCollapsed={isMobileSidebarCollapsed}
                            onToggleCollapsed={handleToggleMobileSidebar}
                        />
                    </div>

                    {selectedFriend ? (
                        <div ref={topPanelsRef} className="grid min-w-0 gap-2.5 sm:gap-4 xl:gap-5">
                            <ChatHeaderCard selectedFriend={selectedFriend} lastSharedAt={friendLastSharedAt} />

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
                                lastSharedAt={lastSharedAt}
                                canSaveMyLocation={hasMyLocationStatusData}
                                canSaveFriendLocation={hasFriendLocationStatusData}
                                myLocationPreviewValue={mySharedLocation?.address ?? ""}
                                friendLocationPreviewValue={selectedFriend.locationSnapshot?.address ?? ""}
                                myResolvedLocation={mySharedLocation ? {
                                    label: mySharedLocation.label,
                                    address: mySharedLocation.address,
                                    latitude: mySharedLocation.latitude,
                                    longitude: mySharedLocation.longitude,
                                } : null}
                                friendResolvedLocation={selectedFriend.locationSnapshot ? {
                                    label: `${selectedFriend.nickname} 현재 위치`,
                                    address: selectedFriend.locationSnapshot.address,
                                    latitude: selectedFriend.locationSnapshot.latitude,
                                    longitude: selectedFriend.locationSnapshot.longitude,
                                } : null}
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
                        onDeleteSavedDeparture={handleDeleteSavedDeparture}
                        onDeleteAllSavedDepartures={handleDeleteAllSavedDepartures}
                        onUpdateSavedDeparture={handleUpdateSavedDeparture}
                        onRecommend={handleRecommend}
                        hasRecommendations={hasRecommendations}
                        recommendationCards={recommendationCards}
                        mapMarkers={mapMarkers}
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