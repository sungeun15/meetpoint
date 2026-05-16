import type { FormEvent } from "react";
import Image from "next/image";

import { friendsGradientBackground } from "./data";
import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "./fonts";
import { FriendSearchField } from "./friend-search-field";
import type { FriendItem } from "./types";

type FriendsContentProps = {
    pendingNickname: string;
    onPendingNicknameChange: (nextValue: string) => void;
    searchedFriend: FriendItem | null;
    isSearchedFriendAlreadyAdded: boolean;
    isSearchingFriend: boolean;
    isSubmittingFriend: boolean;
    onSearchFriend: (event: FormEvent<HTMLFormElement>) => void;
    onAddFriend: () => void;
    formMessage: string | null;
    totalFriendCount: number;
    filteredFriendCount: number;
    selectedFriend: FriendItem | null;
};

export function FriendsContent({
    pendingNickname,
    onPendingNicknameChange,
    searchedFriend,
    isSearchedFriendAlreadyAdded,
    isSearchingFriend,
    isSubmittingFriend,
    onSearchFriend,
    onAddFriend,
    formMessage,
    totalFriendCount,
    filteredFriendCount,
    selectedFriend,
}: FriendsContentProps) {
    const hasFriends = totalFriendCount > 0;

    return (
        <div className="grid gap-4 sm:gap-5 lg:h-full lg:grid-rows-[auto_minmax(0,1fr)] xl:gap-6">
            <section className="rounded-[22px] bg-white px-4 py-5 shadow-[0px_18px_44px_rgba(52,41,104,0.14)] sm:rounded-[24px] sm:px-6 sm:py-7 lg:rounded-[26px] lg:px-8 lg:py-9 xl:px-8 xl:py-10">
                <div className="space-y-4">
                    <h2 className={`${friendsHeadingFont.className} text-[24px] font-bold leading-none text-[#111827] sm:text-[28px] lg:text-[32px]`}>
                        친구 추가하기
                    </h2>
                    <p className={`${friendsDisplayFont.className} max-w-[26ch] text-[14px] leading-[1.65] text-[#6b7280] sm:text-[16px] sm:leading-[1.75] lg:text-[20px] lg:leading-[1.8]`}>
                        닉네임으로 친구를 검색하고 목록에 바로 추가해보세요.
                    </p>
                </div>

                <form className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:gap-3 lg:mt-8 lg:gap-[10px] xl:mt-10" onSubmit={onSearchFriend}>
                    <FriendSearchField
                        value={pendingNickname}
                        onChange={onPendingNicknameChange}
                        placeholder="닉네임을 입력하세요"
                        className="flex-1"
                        inputClassName="sm:h-[50px] lg:h-[52px]"
                    />

                    <button
                        type="submit"
                        disabled={isSearchingFriend}
                        className={`${friendsHeadingFont.className} inline-flex h-11 w-full cursor-pointer items-center justify-center whitespace-nowrap rounded-[12px] border-[3px] border-white px-4 text-[15px] font-bold text-white shadow-[0px_10px_24px_rgba(108,92,231,0.18)] transition-opacity hover:opacity-95 sm:h-[50px] sm:px-5 sm:text-[17px] md:w-[132px] md:shrink-0 lg:h-[52px] lg:w-[128px] lg:text-[20px]`}
                        style={{ backgroundImage: friendsGradientBackground }}
                    >
                        {isSearchingFriend ? "검색 중" : "검색"}
                    </button>
                </form>

                {formMessage ? (
                    <p className={`${friendsBodyFont.className} mt-3 text-[13px] leading-[1.6] text-[#6c5ce7] sm:text-sm lg:text-[15px]`}>
                        {formMessage}
                    </p>
                ) : null}

                {searchedFriend ? (
                    <article className="mt-4 rounded-[18px] border border-[#ddd8ff] bg-[#f8f5ff] px-4 py-4 shadow-[0px_12px_24px_rgba(52,41,104,0.08)] sm:px-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <p className={`${friendsBodyFont.className} text-[11px] uppercase tracking-[0.18em] text-[#8a7be5]`}>
                                    검색 결과
                                </p>
                                <p className={`${friendsHeadingFont.className} mt-2 text-[20px] text-[#111827] sm:text-[22px]`}>
                                    {searchedFriend.nickname}
                                </p>
                                <p className={`${friendsDisplayFont.className} mt-2 text-[14px] leading-[1.6] text-[#4f5875]`}>
                                    {searchedFriend.status}
                                </p>
                                <p className={`${friendsBodyFont.className} mt-2 text-[13px] leading-[1.65] text-[#6b7280]`}>
                                    {searchedFriend.locationHint}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={onAddFriend}
                                disabled={isSearchedFriendAlreadyAdded || isSubmittingFriend}
                                className={`${friendsHeadingFont.className} inline-flex h-11 w-full items-center justify-center rounded-[12px] border border-[#d7cef9] bg-white px-5 text-[16px] font-bold text-[#5f47d2] shadow-[0px_10px_20px_rgba(108,92,231,0.12)] transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-55 sm:h-12 sm:w-auto sm:min-w-[132px]`}
                            >
                                {isSearchedFriendAlreadyAdded ? "이미 등록됨" : isSubmittingFriend ? "추가 중..." : "친구 추가"}
                            </button>
                        </div>
                    </article>
                ) : null}
            </section>

            <section className="relative overflow-hidden rounded-[22px] bg-[#dcd2ff] px-4 py-4 shadow-[0px_18px_44px_rgba(52,41,104,0.12)] sm:rounded-[24px] sm:px-6 sm:py-5 lg:rounded-[26px] lg:px-8 lg:py-6">
                <Image
                    alt="Background pattern"
                    src="/imports/Frame3/background-pattern.svg"
                    width={420}
                    height={220}
                    className="absolute bottom-0 left-0 h-auto w-[220px] opacity-20 sm:w-[300px] lg:w-[380px]"
                />

                <div className="relative z-10 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)] lg:items-stretch">
                    <div className="rounded-[20px] bg-white/82 px-4 py-4 shadow-[0px_14px_30px_rgba(52,41,104,0.12)] sm:px-5 sm:py-5">
                        <span className={`${friendsBodyFont.className} inline-flex rounded-full bg-[#efeaff] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#6c5ce7]`}>
                            Friends Hub
                        </span>
                        <h2 className={`${friendsHeadingFont.className} mt-3 text-[20px] font-bold leading-none text-[#111827] sm:text-[24px] lg:text-[28px]`}>
                            상세 화면으로 들어가기 전 준비 상태를 확인해요
                        </h2>
                        <p className={`${friendsDisplayFont.className} mt-3 max-w-[30ch] text-[14px] leading-[1.6] text-[#5f6782] sm:text-[16px] lg:text-[18px]`}>
                            친구를 고르고 chat 화면으로 넘어가기 전에 친구 목록, 추가 결과, 다음 액션을 한눈에 확인할 수 있는 허브 영역입니다.
                        </p>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <article className="rounded-[16px] bg-[#faf7ff] px-4 py-4 sm:min-h-[112px]">
                                <p className={`${friendsBodyFont.className} text-[11px] uppercase tracking-[0.18em] text-[#8a7be5]`}>
                                    등록된 친구
                                </p>
                                <p className={`${friendsHeadingFont.className} mt-2 text-[24px] text-[#111827]`}>
                                    {totalFriendCount}
                                </p>
                            </article>
                            <article className="rounded-[16px] bg-[#faf7ff] px-4 py-4 sm:min-h-[112px]">
                                <p className={`${friendsBodyFont.className} text-[11px] uppercase tracking-[0.18em] text-[#8a7be5]`}>
                                    현재 목록
                                </p>
                                <p className={`${friendsHeadingFont.className} mt-2 text-[24px] text-[#111827]`}>
                                    {filteredFriendCount}
                                </p>
                            </article>
                            <article className="rounded-[16px] bg-[#faf7ff] px-4 py-4 sm:col-span-2 sm:min-h-[112px] lg:col-span-1">
                                <p className={`${friendsBodyFont.className} text-[11px] uppercase tracking-[0.18em] text-[#8a7be5]`}>
                                    다음 단계
                                </p>
                                <p className={`${friendsDisplayFont.className} mt-2 max-w-[24ch] text-[14px] leading-[1.55] text-[#111827] sm:max-w-none`}>
                                    친구를 눌러 chat 상세 화면으로 이동
                                </p>
                            </article>
                        </div>
                    </div>

                    <div className="grid gap-3">
                        <article className="rounded-[20px] bg-white/86 px-4 py-4 shadow-[0px_14px_30px_rgba(52,41,104,0.12)] sm:px-5 sm:py-5">
                            <p className={`${friendsBodyFont.className} text-[11px] uppercase tracking-[0.18em] text-[#8a7be5]`}>
                                선택된 친구 미리보기
                            </p>
                            {hasFriends && selectedFriend ? (
                                <>
                                    <p className={`${friendsHeadingFont.className} mt-2 text-[22px] text-[#111827] sm:text-[24px]`}>
                                        {selectedFriend.nickname}
                                    </p>
                                    <p className={`${friendsDisplayFont.className} mt-2 text-[14px] leading-[1.6] text-[#4f5875]`}>
                                        {selectedFriend.status}
                                    </p>
                                    <p className={`${friendsBodyFont.className} mt-3 text-[13px] leading-[1.65] text-[#6b7280]`}>
                                        {selectedFriend.locationHint}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className={`${friendsHeadingFont.className} mt-2 text-[22px] text-[#111827] sm:text-[24px]`}>
                                        아직 추가된 친구가 없어요.
                                    </p>
                                    <p className={`${friendsDisplayFont.className} mt-2 text-[14px] leading-[1.6] text-[#4f5875]`}>
                                        닉네임으로 친구를 검색해 목록을 채워보세요.
                                    </p>
                                </>
                            )}
                        </article>

                        <article className="rounded-[20px] bg-[#2f236a] px-4 py-4 text-white shadow-[0px_16px_34px_rgba(36,20,95,0.22)] sm:px-5 sm:py-5">
                            <p className={`${friendsBodyFont.className} text-[11px] uppercase tracking-[0.18em] text-[#cdc5ff]`}>
                                허브 안내
                            </p>
                            <ul className={`${friendsDisplayFont.className} mt-3 space-y-2 text-[14px] leading-[1.6] text-white/90`}>
                                <li>친구를 선택하면 chat 화면에서 대화와 추천 입력 UI를 이어서 볼 수 있어요.</li>
                                <li>친구 추가 결과와 오류 문구는 이 화면에서 먼저 확인할 수 있어요.</li>
                                <li>지도와 추천 결과는 chat 상세 화면에서 목업 UI로 이어집니다.</li>
                            </ul>
                        </article>
                    </div>
                </div>
            </section>
        </div>
    );
}