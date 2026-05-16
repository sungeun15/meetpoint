"use client";

import { useEffect, useMemo, useState } from "react";

import type { ApiResponse } from "@/lib/contracts/api";

import { FriendAddConfirmLayer } from "./friends/friend-add-confirm-layer";
import { FriendsContent } from "./friends/friends-content";
import { FriendsSidebar } from "./friends/friends-sidebar";
import type { FriendItem } from "./friends/types";

type FriendSummary = {
    id: string;
    relationId?: string;
    nickname: string;
    lat: number | null;
    lng: number | null;
    locationUpdatedAt: string | null;
};

type FriendsListResponse = {
    friends: FriendSummary[];
};

type FriendCreateResponse = {
    relationId: string;
    friend: FriendSummary;
};

type FriendSearchResponse = {
    friend: FriendSummary | null;
};

function formatLocationUpdatedLabel(locationUpdatedAt: string | null) {
    if (!locationUpdatedAt) {
        return null;
    }

    const date = new Date(locationUpdatedAt);

    if (Number.isNaN(date.getTime())) {
        return "최근";
    }

    return new Intl.DateTimeFormat("ko-KR", {
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(date);
}

function mapFriendSummaryToItem(friend: FriendSummary): FriendItem {
    const updatedLabel = formatLocationUpdatedLabel(friend.locationUpdatedAt);
    const latitude = friend.lat;
    const longitude = friend.lng;
    const hasLocation = latitude !== null && longitude !== null;

    return {
        id: friend.id,
        nickname: friend.nickname,
        status: hasLocation
            ? (updatedLabel ? `${updatedLabel} 위치를 공유했어요` : "최근 위치를 공유했어요")
            : "아직 위치를 공유하지 않았어요",
        locationHint: hasLocation
            ? `현재 저장된 좌표는 ${latitude.toFixed(5)}, ${longitude.toFixed(5)} 입니다.`
            : "위치 공유를 시작하면 chat 화면에서 좌표와 상태를 확인할 수 있어요.",
        locationSnapshot: hasLocation
            ? {
                address: `좌표 ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
                latitude,
                longitude,
                sharedAt: updatedLabel,
            }
            : undefined,
    };
}

function upsertFriendItem(currentFriends: FriendItem[], nextFriend: FriendItem) {
    const existingIndex = currentFriends.findIndex((friend) => friend.id === nextFriend.id);

    if (existingIndex === -1) {
        return [nextFriend, ...currentFriends];
    }

    const nextFriends = [...currentFriends];
    nextFriends[existingIndex] = nextFriend;
    return nextFriends;
}

export function FriendsScreen() {
    const [friends, setFriends] = useState<FriendItem[]>([]);
    const [friendSearch, setFriendSearch] = useState("");
    const [pendingNickname, setPendingNickname] = useState("");
    const [searchedFriend, setSearchedFriend] = useState<FriendItem | null>(null);
    const [isSearchedFriendAlreadyAdded, setIsSearchedFriendAlreadyAdded] = useState(false);
    const [isFriendConfirmLayerOpen, setIsFriendConfirmLayerOpen] = useState(false);
    const [selectedFriendId, setSelectedFriendId] = useState("");
    const [formMessage, setFormMessage] = useState<string | null>(null);
    const [isLoadingFriends, setIsLoadingFriends] = useState(true);
    const [isSearchingFriend, setIsSearchingFriend] = useState(false);
    const [isSubmittingFriend, setIsSubmittingFriend] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function loadFriends() {
            setIsLoadingFriends(true);

            try {
                const response = await fetch("/api/friends", {
                    method: "GET",
                    cache: "no-store",
                });
                const payload = (await response.json()) as ApiResponse<FriendsListResponse>;

                if (!isMounted) {
                    return;
                }

                if (response.status === 401) {
                    window.location.href = "/login";
                    return;
                }

                if (!response.ok || !payload.ok) {
                    setFriends([]);
                    setFormMessage(payload.ok ? "친구 목록을 불러오지 못했습니다." : payload.error.message);
                    return;
                }

                const nextFriends = payload.data.friends.map(mapFriendSummaryToItem);
                setFriends(nextFriends);
                setSelectedFriendId((currentSelectedFriendId) => currentSelectedFriendId || nextFriends[0]?.id || "");
                setFormMessage(null);
            } catch {
                if (!isMounted) {
                    return;
                }

                setFriends([]);
                setFormMessage("네트워크 오류로 친구 목록을 불러오지 못했습니다.");
            } finally {
                if (isMounted) {
                    setIsLoadingFriends(false);
                }
            }
        }

        void loadFriends();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!friends.length) {
            if (selectedFriendId) {
                setSelectedFriendId("");
            }
            return;
        }

        if (!friends.some((friend) => friend.id === selectedFriendId)) {
            setSelectedFriendId(friends[0]?.id ?? "");
        }
    }, [friends, selectedFriendId]);

    const filteredFriends = useMemo(() => {
        const normalizedQuery = friendSearch.trim().toLowerCase();

        if (!normalizedQuery) {
            return friends;
        }

        return friends.filter((friend) => friend.nickname.toLowerCase().includes(normalizedQuery));
    }, [friendSearch, friends]);

    const selectedFriend = useMemo(
        () => friends.find((friend) => friend.id === selectedFriendId) ?? friends[0] ?? null,
        [friends, selectedFriendId],
    );

    async function handleSearchFriend(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const normalizedNickname = pendingNickname.trim();

        if (!normalizedNickname) {
            setFormMessage("닉네임을 입력해 주세요.");
            return;
        }

        if (isSearchingFriend) {
            return;
        }

        setIsSearchingFriend(true);

        try {
            const response = await fetch(`/api/friends?nickname=${encodeURIComponent(normalizedNickname)}`, {
                method: "GET",
                cache: "no-store",
            });
            const payload = (await response.json()) as ApiResponse<FriendSearchResponse>;

            if (response.status === 401) {
                window.location.href = "/login";
                return;
            }

            if (!response.ok || !payload.ok) {
                setSearchedFriend(null);
                setIsSearchedFriendAlreadyAdded(false);
                setFormMessage(payload.ok ? "친구 검색 중 오류가 발생했습니다." : payload.error.message);
                return;
            }

            if (!payload.data.friend) {
                setSearchedFriend(null);
                setIsSearchedFriendAlreadyAdded(false);
                setIsFriendConfirmLayerOpen(false);
                setFormMessage("해당 닉네임의 사용자를 찾지 못했습니다.");
                return;
            }

            const nextFriend = mapFriendSummaryToItem(payload.data.friend);
            const alreadyAdded = friends.some((friend) => friend.id === nextFriend.id);

            setSearchedFriend(nextFriend);
            setIsSearchedFriendAlreadyAdded(alreadyAdded);
            setFormMessage(
                alreadyAdded
                    ? `${nextFriend.nickname} 님은 이미 친구 목록에 있어요.`
                    : "검색 결과를 확인한 뒤 친구 추가를 눌러 주세요.",
            );
        } catch {
            setSearchedFriend(null);
            setIsSearchedFriendAlreadyAdded(false);
            setIsFriendConfirmLayerOpen(false);
            setFormMessage("네트워크 오류로 친구를 검색하지 못했습니다.");
        } finally {
            setIsSearchingFriend(false);
        }
    }

    function handleAddFriend() {
        if (!searchedFriend) {
            setFormMessage("먼저 닉네임으로 친구를 검색해 주세요.");
            return;
        }

        if (isSubmittingFriend) {
            return;
        }

        const existingFriend = friends.find(
            (friend) => friend.id === searchedFriend.id,
        );

        if (existingFriend) {
            setSelectedFriendId(existingFriend.id);
            setFormMessage(`${existingFriend.nickname} 님은 이미 친구 목록에 있어요.`);
            return;
        }

        setIsFriendConfirmLayerOpen(true);
    }

    async function handleConfirmAddFriend() {
        if (!searchedFriend) {
            setIsFriendConfirmLayerOpen(false);
            setFormMessage("먼저 닉네임으로 친구를 검색해 주세요.");
            return;
        }

        if (isSubmittingFriend) {
            return;
        }

        setIsSubmittingFriend(true);

        try {
            const response = await fetch("/api/friends", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    friendNickname: searchedFriend.nickname,
                }),
            });
            const payload = (await response.json()) as ApiResponse<FriendCreateResponse>;

            if (response.status === 401) {
                window.location.href = "/login";
                return;
            }

            if (!response.ok || !payload.ok) {
                setFormMessage(payload.ok ? "친구 추가 중 오류가 발생했습니다." : payload.error.message);
                return;
            }

            const nextFriend = mapFriendSummaryToItem(payload.data.friend);
            setFriends((currentFriends) => upsertFriendItem(currentFriends, nextFriend));
            setSelectedFriendId(nextFriend.id);
            setPendingNickname("");
            setSearchedFriend(null);
            setIsSearchedFriendAlreadyAdded(false);
            setIsFriendConfirmLayerOpen(false);
            setFormMessage(`${nextFriend.nickname} 님을 친구 목록에 추가했어요.`);
        } catch {
            setFormMessage("네트워크 오류로 친구를 추가하지 못했습니다.");
        } finally {
            setIsSubmittingFriend(false);
        }
    }

    return (
        <section className="flex min-h-[calc(100vh-72px)] flex-1 bg-[#eeebff] px-2.5 py-4 sm:px-5 sm:py-6 md:min-h-[calc(100vh-84px)] md:px-6 md:py-8 lg:px-8 lg:py-10 xl:px-10 xl:py-12">
            <div className="mx-auto grid w-full max-w-[1440px] gap-4 sm:gap-5 lg:min-h-full lg:grid-cols-[320px_minmax(0,1fr)] lg:items-stretch xl:grid-cols-[360px_minmax(0,1fr)] xl:gap-6">
                <FriendsSidebar
                    friendSearch={friendSearch}
                    onFriendSearchChange={setFriendSearch}
                    filteredFriends={filteredFriends}
                    selectedFriendId={selectedFriendId}
                    onSelectFriend={setSelectedFriendId}
                    getFriendHref={(friendId) => `/chat?friend=${friendId}`}
                />

                <FriendsContent
                    pendingNickname={pendingNickname}
                    onPendingNicknameChange={(nextValue) => {
                        setPendingNickname(nextValue);
                        setSearchedFriend(null);
                        setIsSearchedFriendAlreadyAdded(false);
                        setIsFriendConfirmLayerOpen(false);
                        if (formMessage) {
                            setFormMessage(null);
                        }
                    }}
                    searchedFriend={searchedFriend}
                    isSearchedFriendAlreadyAdded={isSearchedFriendAlreadyAdded}
                    isSearchingFriend={isSearchingFriend}
                    isSubmittingFriend={isSubmittingFriend}
                    onSearchFriend={handleSearchFriend}
                    onAddFriend={handleAddFriend}
                    formMessage={isLoadingFriends ? "친구 목록을 불러오는 중이에요." : formMessage}
                    totalFriendCount={friends.length}
                    filteredFriendCount={filteredFriends.length}
                    selectedFriend={selectedFriend}
                />
            </div>

            {isFriendConfirmLayerOpen && searchedFriend ? (
                <FriendAddConfirmLayer
                    friend={searchedFriend}
                    isSubmitting={isSubmittingFriend}
                    onClose={() => setIsFriendConfirmLayerOpen(false)}
                    onConfirm={handleConfirmAddFriend}
                />
            ) : null}
        </section>
    );
}