import Link from "next/link";

import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "./fonts";
import { getFriendInitial } from "./data";
import type { FriendItem } from "./types";
import { FriendSearchField } from "./friend-search-field";

type FriendsSidebarProps = {
    friendSearch: string;
    onFriendSearchChange: (nextValue: string) => void;
    filteredFriends: FriendItem[];
    selectedFriendId: string;
    selectedFriendName?: string | null;
    onSelectFriend: (friendId: string) => void;
    getFriendHref?: (friendId: string) => string;
    isCollapsible?: boolean;
    isCollapsed?: boolean;
    onToggleCollapsed?: () => void;
};

export function FriendsSidebar({
    friendSearch,
    onFriendSearchChange,
    filteredFriends,
    selectedFriendId,
    selectedFriendName,
    onSelectFriend,
    getFriendHref,
    isCollapsible = false,
    isCollapsed = false,
    onToggleCollapsed,
}: FriendsSidebarProps) {
    const triggerLabel = selectedFriendName ? `${selectedFriendName} 대화 보기` : "친구 목록 펼치기";

    return (
        <aside className="overflow-hidden rounded-[22px] bg-white px-3.5 py-3.5 shadow-[0px_18px_44px_rgba(52,41,104,0.14)] sm:rounded-[24px] sm:px-5 sm:py-5 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:rounded-[26px] lg:px-6 lg:py-6">
            {isCollapsible ? (
                <button
                    type="button"
                    onClick={onToggleCollapsed}
                    className="flex w-full items-center justify-between gap-3 rounded-[18px] border border-[#e2dcff] bg-[#f7f4ff] px-3.5 py-3 text-left lg:hidden"
                >
                    <div className="min-w-0">
                        <p className={`${friendsHeadingFont.className} text-[15px] text-[#111827]`}>
                            친구 목록
                        </p>
                        <p className={`${friendsBodyFont.className} mt-1 truncate text-[11px] text-[#6b7280]`}>
                            {isCollapsed ? triggerLabel : "친구를 선택해 대화를 전환할 수 있어요."}
                        </p>
                    </div>
                    <span className="shrink-0 text-[18px] leading-none text-[#6c5ce7]">
                        {isCollapsed ? "▾" : "▴"}
                    </span>
                </button>
            ) : null}

            <div className={`${isCollapsible && isCollapsed ? "hidden" : "block"} lg:block`}>
                <div className="space-y-1">
                    <h1 className={`${friendsHeadingFont.className} text-[21px] font-bold leading-none text-[#111827] sm:text-[28px] lg:text-[32px]`}>
                        친구 목록
                    </h1>
                    <p className={`${friendsDisplayFont.className} text-[12px] leading-[1.45] text-[#6b7280] sm:text-[16px] lg:text-[18px]`}>
                        친구를 검색하고 선택해 대화 흐름을 이어갈 수 있어요.
                    </p>
                </div>

                <FriendSearchField
                    value={friendSearch}
                    onChange={onFriendSearchChange}
                    placeholder="친구 이름 검색"
                    className="mt-4 sm:mt-5"
                />

                <div className="mt-3.5 max-h-[min(34vh,16rem)] space-y-2 overflow-y-auto pr-1 sm:mt-5 sm:max-h-[22rem] sm:space-y-3 lg:max-h-none lg:min-h-0 lg:flex-1">
                    {filteredFriends.length > 0 ? (
                        filteredFriends.map((friend) => {
                            const isSelected = friend.id === selectedFriendId;
                            const friendHref = getFriendHref?.(friend.id);
                            const itemClassName = `flex w-full cursor-pointer items-center gap-2.5 rounded-[16px] border bg-white px-3 py-2.5 text-left transition-all duration-200 sm:gap-4 sm:rounded-[18px] sm:px-4 sm:py-4 ${isSelected
                                ? "border-[#6c5ce7] bg-[#f4f0ff] shadow-[0px_12px_30px_rgba(108,92,231,0.12)]"
                                : "border-black/10 hover:border-[#c7bcff] hover:bg-[#faf8ff]"
                                }`;
                            const itemContent = (
                                <>
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d9d9d9] text-[16px] text-[#111827] sm:h-[48px] sm:w-[48px] sm:text-[20px] lg:h-[52px] lg:w-[52px] lg:text-[22px]">
                                        <span className={`${friendsDisplayFont.className} leading-none`}>
                                            {getFriendInitial(friend.nickname)}
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className={`${friendsDisplayFont.className} truncate text-[16px] leading-none text-black sm:text-[20px] lg:text-[22px]`}>
                                            {friend.nickname}
                                        </p>
                                        <p className={`${friendsBodyFont.className} mt-1 truncate text-[11px] text-[#6b7280] sm:mt-2 sm:text-sm lg:text-[15px]`}>
                                            {friend.status}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-[20px] leading-none text-[#6c5ce7] sm:text-[26px] lg:text-[28px]">›</span>
                                </>
                            );

                            if (friendHref) {
                                return (
                                    <Link
                                        key={friend.id}
                                        href={friendHref}
                                        onClick={() => onSelectFriend(friend.id)}
                                        className={itemClassName}
                                    >
                                        {itemContent}
                                    </Link>
                                );
                            }

                            return (
                                <button
                                    key={friend.id}
                                    type="button"
                                    onClick={() => onSelectFriend(friend.id)}
                                    className={itemClassName}
                                >
                                    {itemContent}
                                </button>
                            );
                        })
                    ) : (
                        <div className="rounded-[16px] border border-dashed border-[#d1d5db] bg-[#fcfbff] px-4 py-6 text-center sm:rounded-[18px] sm:px-5 sm:py-8">
                            <p className={`${friendsDisplayFont.className} text-[17px] text-[#6b7280] sm:text-[20px]`}>
                                검색된 친구가 없어요.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}