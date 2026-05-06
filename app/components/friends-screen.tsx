"use client";

import { useMemo, useState } from "react";
import { FriendsContent } from "./friends/friends-content";
import { initialFriends } from "./friends/data";
import { FriendsSidebar } from "./friends/friends-sidebar";
import type { FriendItem } from "./friends/types";

export function FriendsScreen() {
    const [friends, setFriends] = useState(initialFriends);
    const [friendSearch, setFriendSearch] = useState("");
    const [pendingNickname, setPendingNickname] = useState("");
    const [selectedFriendId, setSelectedFriendId] = useState(initialFriends[0]?.id ?? "");
    const [formMessage, setFormMessage] = useState<string | null>(null);

    const filteredFriends = useMemo(() => {
        const normalizedQuery = friendSearch.trim().toLowerCase();

        if (!normalizedQuery) {
            return friends;
        }

        return friends.filter((friend) => friend.nickname.toLowerCase().includes(normalizedQuery));
    }, [friendSearch, friends]);

    function handleAddFriend(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const normalizedNickname = pendingNickname.trim();

        if (!normalizedNickname) {
            setFormMessage("닉네임을 입력해 주세요.");
            return;
        }

        const existingFriend = friends.find(
            (friend) => friend.nickname.toLowerCase() === normalizedNickname.toLowerCase(),
        );

        if (existingFriend) {
            setSelectedFriendId(existingFriend.id);
            setFormMessage(`${existingFriend.nickname} 님은 이미 친구 목록에 있어요.`);
            return;
        }

        const nextFriend: FriendItem = {
            id: `friend-${Date.now()}`,
            nickname: normalizedNickname,
            status: "친구 목록에 방금 추가됐어요",
            locationHint: "새 친구와 위치 공유를 시작할 수 있어요.",
        };

        setFriends((currentFriends) => [nextFriend, ...currentFriends]);
        setSelectedFriendId(nextFriend.id);
        setPendingNickname("");
        setFormMessage(`${nextFriend.nickname} 님을 친구 목록에 추가했어요.`);
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
                />

                <FriendsContent
                    pendingNickname={pendingNickname}
                    onPendingNicknameChange={(nextValue) => {
                        setPendingNickname(nextValue);
                        if (formMessage) {
                            setFormMessage(null);
                        }
                    }}
                    onAddFriend={handleAddFriend}
                    formMessage={formMessage}
                />
            </div>
        </section>
    );
}