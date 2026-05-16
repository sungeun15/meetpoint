"use client";

import { FriendAddConfirmLayer } from "./friends/friend-add-confirm-layer";
import { FriendsContent } from "./friends/friends-content";
import { FriendsSidebar } from "./friends/friends-sidebar";
import { useFriendsScreenState } from "./friends/use-friends-screen-state";

export function FriendsScreen() {
    const state = useFriendsScreenState();

    return (
        <section className="flex min-h-[calc(100vh-72px)] flex-1 bg-[#eeebff] px-2.5 py-4 sm:px-5 sm:py-6 md:min-h-[calc(100vh-84px)] md:px-6 md:py-8 lg:px-8 lg:py-10 xl:px-10 xl:py-12">
            <div className="mx-auto grid w-full max-w-360 gap-4 sm:gap-5 lg:min-h-full lg:grid-cols-[320px_minmax(0,1fr)] lg:items-stretch xl:grid-cols-[360px_minmax(0,1fr)] xl:gap-6">
                <FriendsSidebar
                    isLoadingFriends={state.isLoadingFriends}
                    friendSearch={state.friendSearch}
                    onFriendSearchChange={state.setFriendSearch}
                    filteredFriends={state.filteredFriends}
                    selectedFriendId={state.selectedFriendId}
                    onSelectFriend={state.setSelectedFriendId}
                    getFriendHref={(friendId) => `/chat?friend=${friendId}`}
                />

                <FriendsContent
                    isLoadingFriends={state.isLoadingFriends}
                    pendingNickname={state.pendingNickname}
                    onPendingNicknameChange={state.handlePendingNicknameChange}
                    searchedFriend={state.searchedFriend}
                    searchedFriendRelation={state.searchedFriendRelation}
                    isSearchingFriend={state.isSearchingFriend}
                    isSubmittingFriend={state.isSubmittingFriend}
                    processingRequestId={state.processingRequestId}
                    onSearchFriend={state.handleSearchFriend}
                    onAddFriend={state.handleAddFriend}
                    onAcceptRequest={state.handleAcceptRequest}
                    onRejectRequest={state.handleRejectRequest}
                    formMessage={state.formMessage}
                    totalFriendCount={state.totalFriendCount}
                    selectedFriend={state.selectedFriend}
                    incomingRequests={state.incomingRequests}
                    outgoingRequests={state.outgoingRequests}
                />
            </div>

            {state.isFriendConfirmLayerOpen && state.searchedFriend ? (
                <FriendAddConfirmLayer
                    friend={state.searchedFriend}
                    isSubmitting={state.isSubmittingFriend}
                    onClose={state.closeFriendConfirmLayer}
                    onConfirm={state.confirmAddFriend}
                />
            ) : null}
        </section>
    );
}