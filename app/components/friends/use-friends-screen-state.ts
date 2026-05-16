"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import type { ApiResponse } from "@/lib/contracts/api";
import type {
    FriendsListResponse,
    FriendRelationState,
    FriendRequestActionResponse,
    FriendRequestCreateResponse,
    FriendSearchResponse,
} from "@/lib/contracts/friends";

import { mapFriendSummaryToItem, mapPendingFriendRequestToItem } from "./mappers";
import type { FriendItem, PendingFriendRequestItem } from "./types";

type FriendsApiResult<T> =
    | {
        status: "success";
        data: T;
    }
    | {
        status: "redirect";
    }
    | {
        status: "error";
        message: string;
    };

function redirectToLogin() {
    window.location.href = "/login";
}

async function requestFriendsApi<T>(
    input: RequestInfo | URL,
    init: RequestInit,
    fallbackMessage: string,
): Promise<FriendsApiResult<T>> {
    // friends 화면에서 반복되는 401 리다이렉트와 API 에러 문구 처리를 한곳으로 모은다.
    const response = await fetch(input, init);
    const payload = (await response.json()) as ApiResponse<T>;

    if (response.status === 401) {
        redirectToLogin();
        return { status: "redirect" };
    }

    if (!response.ok || !payload.ok) {
        return {
            status: "error",
            message: payload.ok ? fallbackMessage : payload.error.message,
        };
    }

    return {
        status: "success",
        data: payload.data,
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

function upsertPendingFriendRequestItem(
    currentRequests: PendingFriendRequestItem[],
    nextRequest: PendingFriendRequestItem,
) {
    const existingIndex = currentRequests.findIndex((request) => request.requestId === nextRequest.requestId);

    if (existingIndex === -1) {
        return [nextRequest, ...currentRequests];
    }

    const nextRequests = [...currentRequests];
    nextRequests[existingIndex] = nextRequest;
    return nextRequests;
}

export function useFriendsScreenState() {
    const [friends, setFriends] = useState<FriendItem[]>([]);
    const [friendSearch, setFriendSearch] = useState("");
    const [pendingNickname, setPendingNickname] = useState("");
    const [searchedFriend, setSearchedFriend] = useState<FriendItem | null>(null);
    const [searchedFriendRelation, setSearchedFriendRelation] = useState<FriendRelationState | null>(null);
    const [isFriendConfirmLayerOpen, setIsFriendConfirmLayerOpen] = useState(false);
    const [selectedFriendId, setSelectedFriendId] = useState("");
    const [formMessage, setFormMessage] = useState<string | null>(null);
    const [isLoadingFriends, setIsLoadingFriends] = useState(true);
    const [isSearchingFriend, setIsSearchingFriend] = useState(false);
    const [isSubmittingFriend, setIsSubmittingFriend] = useState(false);
    const [incomingRequests, setIncomingRequests] = useState<PendingFriendRequestItem[]>([]);
    const [outgoingRequests, setOutgoingRequests] = useState<PendingFriendRequestItem[]>([]);
    const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadFriends() {
            setIsLoadingFriends(true);

            try {
                const result = await requestFriendsApi<FriendsListResponse>(
                    "/api/friends",
                    {
                        method: "GET",
                        cache: "no-store",
                    },
                    "친구 목록을 불러오지 못했습니다.",
                );

                if (!isMounted || result.status === "redirect") {
                    return;
                }

                if (result.status === "error") {
                    setFriends([]);
                    setIncomingRequests([]);
                    setOutgoingRequests([]);
                    setFormMessage(result.message);
                    return;
                }

                const nextFriends = result.data.friends.map(mapFriendSummaryToItem);
                setFriends(nextFriends);
                setIncomingRequests(result.data.incomingRequests.map((request) => mapPendingFriendRequestToItem(request, "incoming")));
                setOutgoingRequests(result.data.outgoingRequests.map((request) => mapPendingFriendRequestToItem(request, "outgoing")));
                setSelectedFriendId((currentSelectedFriendId) => currentSelectedFriendId || nextFriends[0]?.id || "");
                setFormMessage(null);
            } catch {
                if (!isMounted) {
                    return;
                }

                setFriends([]);
                setIncomingRequests([]);
                setOutgoingRequests([]);
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

    const filteredFriends = useMemo(() => {
        const normalizedQuery = friendSearch.trim().toLowerCase();

        if (!normalizedQuery) {
            return friends;
        }

        return friends.filter((friend) => friend.nickname.toLowerCase().includes(normalizedQuery));
    }, [friendSearch, friends]);

    // 목록이 갱신된 뒤에도 존재하는 친구만 선택 상태로 유지하고, 아니면 첫 항목으로 안전하게 보정한다.
    const effectiveSelectedFriendId = friends.some((friend) => friend.id === selectedFriendId)
        ? selectedFriendId
        : friends[0]?.id ?? "";

    const selectedFriend = useMemo(
        () => friends.find((friend) => friend.id === effectiveSelectedFriendId) ?? friends[0] ?? null,
        [effectiveSelectedFriendId, friends],
    );

    function resetSearchResult() {
        setSearchedFriend(null);
        setSearchedFriendRelation(null);
        setIsFriendConfirmLayerOpen(false);
    }

    function handlePendingNicknameChange(nextValue: string) {
        setPendingNickname(nextValue);
        resetSearchResult();
        if (formMessage) {
            setFormMessage(null);
        }
    }

    async function handleSearchFriend(event: FormEvent<HTMLFormElement>) {
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
            const result = await requestFriendsApi<FriendSearchResponse>(
                `/api/friends?nickname=${encodeURIComponent(normalizedNickname)}`,
                {
                    method: "GET",
                    cache: "no-store",
                },
                "친구 검색 중 오류가 발생했습니다.",
            );

            if (result.status === "redirect") {
                return;
            }

            if (result.status === "error") {
                resetSearchResult();
                setFormMessage(result.message);
                return;
            }

            if (!result.data.friend) {
                resetSearchResult();
                setFormMessage("해당 닉네임의 사용자를 찾지 못했습니다.");
                return;
            }

            const nextFriend = mapFriendSummaryToItem(result.data.friend);
            const nextRelation = result.data.relation?.state ?? null;

            setSearchedFriend(nextFriend);
            setSearchedFriendRelation(nextRelation);

            if (nextRelation === "accepted") {
                setFormMessage(`${nextFriend.nickname} 님은 이미 수락된 친구 목록에 있어요.`);
                return;
            }

            if (nextRelation === "outgoing_pending") {
                setFormMessage(`${nextFriend.nickname} 님에게 보낸 친구 요청이 아직 대기 중이에요.`);
                return;
            }

            if (nextRelation === "incoming_pending") {
                setFormMessage(`${nextFriend.nickname} 님이 먼저 친구 요청을 보냈어요. 받은 요청 목록에서 처리해 주세요.`);
                return;
            }

            setFormMessage("검색 결과를 확인한 뒤 친구 요청을 보내 주세요.");
        } catch {
            resetSearchResult();
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

        if (searchedFriendRelation === "accepted") {
            setSelectedFriendId(searchedFriend.id);
            setFormMessage(`${searchedFriend.nickname} 님은 이미 친구 목록에 있어요.`);
            return;
        }

        if (searchedFriendRelation === "outgoing_pending") {
            setFormMessage(`${searchedFriend.nickname} 님에게 보낸 친구 요청이 아직 대기 중이에요.`);
            return;
        }

        if (searchedFriendRelation === "incoming_pending") {
            setFormMessage(`${searchedFriend.nickname} 님이 먼저 친구 요청을 보냈어요. 받은 요청에서 수락 또는 거절해 주세요.`);
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
            const result = await requestFriendsApi<FriendRequestCreateResponse>(
                "/api/friends",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        friendNickname: searchedFriend.nickname,
                    }),
                },
                "친구 요청 처리 중 오류가 발생했습니다.",
            );

            if (result.status === "redirect") {
                return;
            }

            if (result.status === "error") {
                setFormMessage(result.message);
                return;
            }

            const nextOutgoingRequest = mapPendingFriendRequestToItem(
                {
                    ...result.data.friend,
                    requestId: result.data.requestId,
                    requestedAt: result.data.requestedAt,
                },
                "outgoing",
            );

            setOutgoingRequests((currentRequests) => upsertPendingFriendRequestItem(currentRequests, nextOutgoingRequest));
            setPendingNickname("");
            resetSearchResult();
            setFormMessage(`${result.data.friend.nickname} 님에게 친구 요청을 보냈어요.`);
        } catch {
            setFormMessage("네트워크 오류로 친구 요청을 보내지 못했습니다.");
        } finally {
            setIsSubmittingFriend(false);
        }
    }

    async function handleFriendRequestAction(requestId: string, action: "accept" | "reject") {
        if (processingRequestId) {
            return;
        }

        setProcessingRequestId(requestId);

        try {
            const result = await requestFriendsApi<FriendRequestActionResponse>(
                "/api/friends",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        requestId,
                        action,
                    }),
                },
                "친구 요청 처리 중 오류가 발생했습니다.",
            );

            if (result.status === "redirect") {
                return;
            }

            if (result.status === "error") {
                setFormMessage(result.message);
                return;
            }

            if (result.data.action === "accept") {
                const acceptedFriend = mapFriendSummaryToItem(result.data.friend);

                setFriends((currentFriends) => upsertFriendItem(currentFriends, acceptedFriend));
                setSelectedFriendId(acceptedFriend.id);
                setIncomingRequests((currentRequests) => currentRequests.filter((request) => request.requestId !== result.data.requestId));

                if (searchedFriend?.id === acceptedFriend.id) {
                    setSearchedFriendRelation("accepted");
                }

                setFormMessage(`${acceptedFriend.nickname} 님과 친구가 되었어요.`);
                return;
            }

            setIncomingRequests((currentRequests) => currentRequests.filter((request) => request.requestId !== result.data.requestId));

            if (searchedFriend?.id === result.data.requesterId) {
                setSearchedFriendRelation(null);
            }

            setFormMessage("친구 요청을 거절했어요.");
        } catch {
            setFormMessage("네트워크 오류로 친구 요청을 처리하지 못했습니다.");
        } finally {
            setProcessingRequestId(null);
        }
    }

    return {
        isLoadingFriends,
        friendSearch,
        setFriendSearch,
        filteredFriends,
        selectedFriendId: effectiveSelectedFriendId,
        setSelectedFriendId,
        pendingNickname,
        handlePendingNicknameChange,
        searchedFriend,
        searchedFriendRelation,
        isSearchingFriend,
        isSubmittingFriend,
        processingRequestId,
        handleSearchFriend,
        handleAddFriend,
        handleAcceptRequest: (requestId: string) => {
            void handleFriendRequestAction(requestId, "accept");
        },
        handleRejectRequest: (requestId: string) => {
            void handleFriendRequestAction(requestId, "reject");
        },
        formMessage,
        totalFriendCount: friends.length,
        selectedFriend,
        incomingRequests,
        outgoingRequests,
        isFriendConfirmLayerOpen,
        closeFriendConfirmLayer: () => setIsFriendConfirmLayerOpen(false),
        confirmAddFriend: handleConfirmAddFriend,
    };
}
