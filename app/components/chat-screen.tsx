"use client";

import { useEffect, useRef, useState } from "react";

import type { LocationShareScope } from "@/lib/contracts/friends";

import { ChatConversationPanel } from "./chat/chat-conversation-panel";
import { ChatHeaderCard } from "./chat/chat-header-card";
import { ChatLocationStatusPanel } from "./chat/chat-location-status-panel";
import { ChatPinPickerLayer } from "./chat/chat-pin-picker-layer";
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

type PendingManualShare = {
    scope: LocationShareScope;
};

export function ChatScreen({ requestedFriendId = null }: ChatScreenProps) {
    const topPanelsRef = useRef<HTMLDivElement | null>(null);
    const sidebarPanelRef = useRef<HTMLDivElement | null>(null);
    const [pendingLocationSave, setPendingLocationSave] = useState<PendingLocationSave | null>(null);
    const [pendingManualShare, setPendingManualShare] = useState<PendingManualShare | null>(null);
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

    function handleOpenManualShareLayer(scope: LocationShareScope) {
        setPendingLocationSave(null);
        setPendingManualShare({ scope });
    }

    function handleCloseManualShareLayer() {
        setPendingManualShare(null);
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

    async function handleConfirmManualShare(location: ResolvedLocation) {
        if (!pendingManualShare) {
            return;
        }

        const didShare = await handleShareResolvedLocation(pendingManualShare.scope, location);

        if (didShare) {
            setPendingManualShare(null);
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
                                onShareLocationToFriend={() => handleShareLocationToFriend(handleOpenManualShareLayer)}
                                onShareLocationToAllFriends={() => handleShareLocationToAllFriends(handleOpenManualShareLayer)}
                                onOpenSaveLocationLayer={handleOpenSaveLocationLayer}
                            />
                        </div>
                    ) : shouldShowLoadingPanels ? (
                        <div ref={topPanelsRef} className="grid min-w-0 gap-2.5 sm:gap-4 xl:gap-5">
                            <div className="rounded-[24px] bg-white px-5 py-5 shadow-[0px_18px_44px_rgba(52,41,104,0.14)] sm:px-6 sm:py-6">
                                <div className="space-y-3 animate-pulse">
                                    <div className="h-6 w-40 rounded-full bg-[#ece7ff]" />
                                    <div className="h-4 w-64 max-w-full rounded-full bg-[#f2eeff]" />
                                </div>
                            </div>

                            <div className="rounded-[24px] bg-white px-5 py-5 shadow-[0px_18px_44px_rgba(52,41,104,0.14)] sm:px-6 sm:py-6">
                                <div className="space-y-3 animate-pulse">
                                    <div className="h-5 w-28 rounded-full bg-[#ece7ff]" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-full rounded-full bg-[#f4f0ff]" />
                                        <div className="h-4 w-5/6 rounded-full bg-[#f4f0ff]" />
                                        <div className="h-12 w-full rounded-2xl bg-[#f7f4ff]" />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-[24px] bg-white px-5 py-5 shadow-[0px_18px_44px_rgba(52,41,104,0.14)] sm:px-6 sm:py-6">
                                <div className="space-y-3 animate-pulse">
                                    <div className="h-5 w-32 rounded-full bg-[#ece7ff]" />
                                    <div className="h-24 w-full rounded-[20px] bg-[#f7f4ff]" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div ref={topPanelsRef} className="rounded-[24px] bg-white px-5 py-8 text-center shadow-[0px_18px_44px_rgba(52,41,104,0.14)] sm:px-6 sm:py-10">
                            <p className="text-[20px] font-semibold text-[#1f2937] sm:text-[24px]">
                                대화를 시작할 친구를 선택해 주세요.
                            </p>
                            <p className="mt-2 text-[14px] leading-[1.7] text-[#6b7280] sm:text-[15px]">
                                아직 수락된 친구가 없다면 friends 화면에서 친구 요청 상태를 먼저 확인해 보세요.
                            </p>
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
                ) : shouldShowLoadingPanels ? (
                    <div className="rounded-[24px] bg-white px-5 py-5 shadow-[0px_18px_44px_rgba(52,41,104,0.14)] sm:px-6 sm:py-6">
                        <div className="space-y-3 animate-pulse">
                            <div className="h-5 w-36 rounded-full bg-[#ece7ff]" />
                            <div className="h-4 w-64 max-w-full rounded-full bg-[#f2eeff]" />
                            <div className="grid gap-3 lg:grid-cols-3">
                                <div className="h-28 rounded-[20px] bg-[#f7f4ff]" />
                                <div className="h-28 rounded-[20px] bg-[#f7f4ff]" />
                                <div className="h-28 rounded-[20px] bg-[#f7f4ff]" />
                            </div>
                        </div>
                    </div>
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
            </div>
        </section>
    );
}