import type { Dispatch, SetStateAction } from "react";
import { useEffect, useMemo, useState } from "react";

import type { FriendLeaveResponse, FriendsListResponse } from "@/lib/contracts/friends";

import type { FriendItem } from "../../friends/types";
import { mapFriendSummaryToItem } from "../../friends/mappers";
import { requestApi } from "./chat-screen-state-api";

const DEFAULT_FRIENDS_POLLING_INTERVAL_MS = 5000;

type UseChatScreenFriendsStateArgs = {
    requestedFriendId: string | null; // 라우트나 상위에서 강제로 지정한 친구 id 입니다.
    setShouldRedirectToLogin: Dispatch<SetStateAction<boolean>>;
    setFeedbackMessage: Dispatch<SetStateAction<string | null>>; // 친구 목록 로드 오류를 상위 화면에 전달합니다.
};

export function useChatScreenFriendsState({
    requestedFriendId,
    setShouldRedirectToLogin,
    setFeedbackMessage,
}: UseChatScreenFriendsStateArgs) {
    const [friends, setFriends] = useState<FriendItem[]>([]);
    const [isLoadingFriends, setIsLoadingFriends] = useState(true);
    const [friendSearch, setFriendSearch] = useState("");
    const [selectedFriendId, setSelectedFriendId] = useState("");

    useEffect(() => {
        let isMounted = true;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        async function loadFriends() {
            try {
                const result = await requestApi<FriendsListResponse>("/api/friends", "친구 목록을 불러오지 못했습니다.", {
                    method: "GET",
                    cache: "no-store",
                });

                if (!isMounted) {
                    return;
                }

                if (result.status === "unauthorized") {
                    setShouldRedirectToLogin(true);
                    return;
                }

                if (result.status === "error") {
                    setFeedbackMessage(result.message);
                    timeoutId = setTimeout(loadFriends, DEFAULT_FRIENDS_POLLING_INTERVAL_MS);
                    return;
                }

                const nextFriends = result.data.friends.map(mapFriendSummaryToItem);
                setFriends(nextFriends);

                if (!nextFriends.length) {
                    // 빈 친구 목록 이동은 상위 ChatScreen 가드가 처리하므로 여기서는 polling만 멈춘다.
                    return;
                }

                timeoutId = setTimeout(loadFriends, DEFAULT_FRIENDS_POLLING_INTERVAL_MS);
            } catch {
                if (!isMounted) {
                    return;
                }

                setFeedbackMessage("네트워크 오류로 친구 목록을 불러오지 못했습니다.");
                timeoutId = setTimeout(loadFriends, DEFAULT_FRIENDS_POLLING_INTERVAL_MS);
            } finally {
                if (isMounted) {
                    setIsLoadingFriends(false);
                }
            }
        }

        void loadFriends();

        return () => {
            isMounted = false;

            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [setFeedbackMessage, setShouldRedirectToLogin]);

    const activeFriendId = requestedFriendId && friends.some((friend) => friend.id === requestedFriendId)
        ? requestedFriendId
        : friends.some((friend) => friend.id === selectedFriendId)
            ? selectedFriendId
            : "";

    const filteredFriends = useMemo(() => {
        const normalizedQuery = friendSearch.trim().toLowerCase();

        if (!normalizedQuery) {
            return friends;
        }

        return friends.filter((friend) => friend.nickname.toLowerCase().includes(normalizedQuery));
    }, [friendSearch, friends]);

    const selectedFriend = useMemo(
        () => friends.find((friend) => friend.id === activeFriendId) ?? null,
        [activeFriendId, friends],
    );

    function handleSelectFriend(friendId: string) {
        setSelectedFriendId(friendId);
        setFeedbackMessage(null);
    }

    async function handleLeaveChatRoom(friendId: string) {
        try {
            const result = await requestApi<FriendLeaveResponse>("/api/friends", "채팅방 나가기에 실패했습니다.", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ friendId }),
            });

            if (result.status === "unauthorized") {
                setShouldRedirectToLogin(true);
                return false;
            }

            if (result.status === "error") {
                setFeedbackMessage(result.message);
                return false;
            }

            setFriends((currentFriends) => currentFriends.filter((friend) => friend.id !== friendId));
            setSelectedFriendId((currentValue) => (currentValue === friendId ? "" : currentValue));
            return true;
        } catch {
            setFeedbackMessage("네트워크 오류로 채팅방 나가기에 실패했습니다.");
            return false;
        }
    }

    return {
        friends,
        setFriends,
        isLoadingFriends,
        friendSearch,
        setFriendSearch,
        activeFriendId,
        filteredFriends,
        selectedFriend,
        handleSelectFriend,
        handleLeaveChatRoom,
    };
}