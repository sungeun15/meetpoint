"use client";

import { useEffect, useRef, useState } from "react";

import { ChatConversationPanel } from "./chat/conversation/chat-conversation-panel";
import { ChatFloatingToast } from "./chat/chat-floating-toast";
import { ChatHeaderCard } from "./chat/chat-header-card";
import { ChatLocationMapLayer } from "./chat/location/chat-location-map-layer";
import { ChatLocationStatusPanel } from "./chat/location/chat-location-status-panel";
import { ChatPinPickerLayer } from "./chat/departure/chat-pin-picker-layer";
import { ChatRecommendationPanels } from "./chat/recommendation/chat-recommendation-panels";
import { ChatSaveLocationLayer } from "./chat/location/chat-save-location-layer";
import {
    buildFriendResolvedLocation,
    buildMyResolvedLocation,
} from "./chat/chat-screen-helpers";
import {
    ChatScreenEmptyState,
    ChatScreenRecommendationLoading,
    ChatScreenTopPanelsLoading,
} from "./chat/chat-screen-placeholders";
import { useChatScreenOverlays } from "./chat/use-chat-screen-overlays";
import { useChatScreenState } from "./chat/use-chat-screen-state";
import { FriendsSidebar } from "./friends/friends-sidebar";

type ChatScreenProps = {
    requestedFriendId?: string | null;
};

export function ChatScreen({ requestedFriendId = null }: ChatScreenProps) {
    const topPanelsRef = useRef<HTMLDivElement | null>(null);
    const sidebarPanelRef = useRef<HTMLDivElement | null>(null);
    const [isMobileSidebarCollapsed, setIsMobileSidebarCollapsed] = useState(true);
    const {
        isLoadingFriends,
        isLoadingMessages,
        isLoadingOlderMessages,
        friendSearch,
        setFriendSearch,
        activeFriendId,
        filteredFriends,
        selectedFriend,
        selectedMessages,
        canLoadOlderMessages,
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
        selectedFriendDepartureLocation,
        selectedDepartureFriendId,
        departureFriendOptions,
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
        handleLoadOlderMessages,
        handleShareLocationToFriend,
        handleShareLocationToAllFriends,
        handleShareResolvedLocation,
        handleMeetingModeChange,
        handleCategoryChange,
        handleDepartureInputMethodChange,
        handleDepartureSearchQueryChange,
        handleDepartureFriendChange,
        handlePinnedDepartureSelect,
        handleSavedDepartureSelect,
        handleDeleteSavedDeparture,
        handleDeleteAllSavedDepartures,
        handleUpdateSavedDeparture,
        handleCreateSavedDeparture,
        handleRecommend,
    } = useChatScreenState(requestedFriendId);
    const friendLastSharedAt = selectedFriend?.locationSnapshot?.sharedAt ?? null;
    const shouldShowLoadingPanels = isLoadingFriends && !selectedFriend;
    const myResolvedLocation = buildMyResolvedLocation(mySharedLocation);
    const friendResolvedLocation = buildFriendResolvedLocation(selectedFriend);
    const {
        pendingLocationSave,
        pendingManualShare,
        activeLocationMap,
        chatScreenToast,
        setChatScreenToast,
        handleShowToast,
        handleOpenSaveLocationLayer,
        handleCloseSaveLocationLayer,
        handleOpenManualShareLayer,
        handleCloseManualShareLayer,
        handleOpenLocationMap,
        handleCloseLocationMap,
        handleConfirmSaveLocation,
        handleConfirmManualShare,
    } = useChatScreenOverlays({
        selectedFriend,
        onCreateSavedDeparture: handleCreateSavedDeparture,
        onShareResolvedLocation: handleShareResolvedLocation,
    });

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
                            <ChatHeaderCard
                                selectedFriend={selectedFriend}
                                lastSharedAt={friendLastSharedAt}
                                friendResolvedLocation={friendResolvedLocation}
                                selectedFriendDepartureLocation={selectedFriendDepartureLocation}
                                onOpenLocationMap={handleOpenLocationMap}
                            />

                            <ChatConversationPanel
                                selectedFriend={selectedFriend}
                                messages={selectedMessages}
                                isLoadingMessages={isLoadingMessages}
                                canLoadOlderMessages={canLoadOlderMessages}
                                isLoadingOlderMessages={isLoadingOlderMessages}
                                draftMessage={draftMessage}
                                onDraftMessageChange={handleDraftMessageChange}
                                onSendMessage={handleSendMessage}
                                onLoadOlderMessages={handleLoadOlderMessages}
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
                                myResolvedLocation={myResolvedLocation}
                                friendResolvedLocation={friendResolvedLocation}
                                onOpenLocationMap={handleOpenLocationMap}
                                onShareLocationToFriend={() => handleShareLocationToFriend(handleOpenManualShareLayer)}
                                onShareLocationToAllFriends={() => handleShareLocationToAllFriends(handleOpenManualShareLayer)}
                                onOpenSaveLocationLayer={handleOpenSaveLocationLayer}
                            />
                        </div>
                    ) : shouldShowLoadingPanels ? (
                        <div ref={topPanelsRef}>
                            <ChatScreenTopPanelsLoading />
                        </div>
                    ) : (
                        <div ref={topPanelsRef}>
                            <ChatScreenEmptyState />
                        </div>
                    )}
                </div>

                {selectedFriend ? (
                    <ChatRecommendationPanels
                        meetingMode={meetingMode}
                        selectedCategory={selectedCategory}
                        departureInputMethod={departureInputMethod}
                        departureSearchQueries={departureSearchQueries}
                        visibleSavedDepartures={visibleSavedDepartures}
                        selectedSavedDepartureIds={selectedSavedDepartureIds}
                        selectedDepartureFriendId={selectedDepartureFriendId}
                        departureFriendOptions={departureFriendOptions}
                        selectedFriendId={activeFriendId}
                        onShowToast={handleShowToast}
                        selectedDepartureLabels={selectedDepartureLabels}
                        selectedFriendName={selectedFriend.nickname}
                        recommendationSummary={recommendationSummary}
                        canRecommend={canRecommend}
                        onMeetingModeChange={handleMeetingModeChange}
                        onCategoryChange={handleCategoryChange}
                        onDepartureInputMethodChange={handleDepartureInputMethodChange}
                        onDepartureSearchQueryChange={handleDepartureSearchQueryChange}
                        onDepartureFriendChange={handleDepartureFriendChange}
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
                ) : shouldShowLoadingPanels ? (
                    <ChatScreenRecommendationLoading />
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

                {pendingManualShare ? (
                    <ChatPinPickerLayer
                        party="me"
                        partyLabel="내 위치"
                        title={pendingManualShare.scope === "friend"
                            ? `${selectedFriend?.nickname ?? "현재 친구"}에게 직접 위치 공유`
                            : "친구 전체에게 직접 위치 공유"}
                        description="브라우저에서 현재 위치를 읽지 못하면 지도에서 직접 위치를 찍거나 주소를 검색해 바로 공유할 수 있어요."
                        confirmLabel={pendingManualShare.scope === "friend" ? "현재 친구에게 공유" : "친구 전체에게 공유"}
                        selectionPrompt={pendingManualShare.scope === "friend"
                            ? `${selectedFriend?.nickname ?? "현재 친구"} 님에게 이 위치를 바로 공유할까요?`
                            : "이 위치를 모든 친구에게 바로 공유할까요?"}
                        emptySelectionMessage="주소 검색이나 지도 클릭으로 내 위치를 직접 지정해 주세요."
                        initialLocation={mySharedLocation ? {
                            label: mySharedLocation.label,
                            address: mySharedLocation.address,
                            latitude: mySharedLocation.latitude,
                            longitude: mySharedLocation.longitude,
                        } : null}
                        onClose={handleCloseManualShareLayer}
                        onConfirm={handleConfirmManualShare}
                    />
                ) : null}

                {activeLocationMap ? (
                    <ChatLocationMapLayer
                        title={activeLocationMap.title}
                        description={activeLocationMap.description}
                        location={activeLocationMap.location}
                        markerVariant={activeLocationMap.markerVariant}
                        onClose={handleCloseLocationMap}
                    />
                ) : null}

                <ChatFloatingToast
                    toast={chatScreenToast}
                    onDismiss={() => setChatScreenToast(null)}
                />
            </div>
        </section>
    );
}