import type { FormEvent } from "react";
import Image from "next/image";

import { friendsGradientBackgroundClassName } from "./data";
import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "./fonts";
import { FriendSearchField } from "./friend-search-field";
import type { FriendItem, FriendRelationState, PendingFriendRequestItem } from "./types";

type FriendsContentProps = {
    isLoadingFriends: boolean;
    pendingNickname: string;
    onPendingNicknameChange: (nextValue: string) => void;
    searchedFriend: FriendItem | null;
    searchedFriendRelation: FriendRelationState | null;
    isSearchingFriend: boolean;
    isSubmittingFriend: boolean;
    processingRequestId: string | null;
    onSearchFriend: (event: FormEvent<HTMLFormElement>) => void;
    onAddFriend: () => void;
    onAcceptRequest: (requestId: string) => void;
    onRejectRequest: (requestId: string) => void;
    formMessage: string | null;
    totalFriendCount: number;
    selectedFriend: FriendItem | null;
    incomingRequests: PendingFriendRequestItem[];
    outgoingRequests: PendingFriendRequestItem[];
};

export function FriendsContent({
    isLoadingFriends,
    pendingNickname,
    onPendingNicknameChange,
    searchedFriend,
    searchedFriendRelation,
    isSearchingFriend,
    isSubmittingFriend,
    processingRequestId,
    onSearchFriend,
    onAddFriend,
    onAcceptRequest,
    onRejectRequest,
    formMessage,
    totalFriendCount,
    selectedFriend,
    incomingRequests,
    outgoingRequests,
}: FriendsContentProps) {
    const hasFriends = totalFriendCount > 0;
    const showLoadingSummary = isLoadingFriends && !formMessage;
    const searchedFriendActionLabel = searchedFriendRelation === "accepted"
        ? "이미 친구"
        : searchedFriendRelation === "outgoing_pending"
            ? "요청 대기 중"
            : searchedFriendRelation === "incoming_pending"
                ? "받은 요청 확인"
                : isSubmittingFriend
                    ? "요청 중..."
                    : "친구 요청";
    const searchedFriendActionDisabled = searchedFriendRelation !== null || isSubmittingFriend;

    return (
        <div className="grid gap-4 sm:gap-5 lg:h-full lg:grid-rows-[auto_minmax(0,1fr)] xl:gap-6">
            <section className="rounded-[22px] bg-white px-4 py-5 shadow-[0px_18px_44px_rgba(52,41,104,0.14)] sm:rounded-3xl sm:px-6 sm:py-7 lg:rounded-[26px] lg:px-8 lg:py-9 xl:px-8 xl:py-10">
                <div className="space-y-4">
                    <h2 className={`${friendsHeadingFont.className} text-[24px] font-bold leading-none text-[#111827] sm:text-[28px] lg:text-[32px]`}>
                        친구 추가하기
                    </h2>
                    <p className={`${friendsDisplayFont.className} max-w-[26ch] text-[14px] leading-[1.65] text-[#6b7280] sm:text-[16px] sm:leading-[1.75] lg:text-[20px] lg:leading-[1.8]`}>
                        닉네임으로 친구를 검색하고 친구 요청을 보내거나 받은 요청을 처리해보세요.
                    </p>
                </div>

                <form className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:gap-3 lg:mt-8 lg:gap-2.5 xl:mt-10" onSubmit={onSearchFriend}>
                    <FriendSearchField
                        value={pendingNickname}
                        onChange={onPendingNicknameChange}
                        placeholder="닉네임을 입력하세요"
                        className="flex-1"
                        inputClassName="sm:h-12.5 lg:h-13"
                    />

                    <button
                        type="submit"
                        disabled={isSearchingFriend}
                        className={`${friendsHeadingFont.className} ${friendsGradientBackgroundClassName} inline-flex h-11 w-full cursor-pointer items-center justify-center whitespace-nowrap rounded-xl border-[3px] border-white px-4 text-[15px] font-bold text-white shadow-[0px_10px_24px_rgba(108,92,231,0.18)] transition-opacity hover:opacity-95 sm:h-12.5 sm:px-5 sm:text-[17px] md:w-33 md:shrink-0 lg:h-13 lg:w-32 lg:text-[20px]`}
                    >
                        {isSearchingFriend ? "검색 중" : "검색"}
                    </button>
                </form>

                {showLoadingSummary ? (
                    <p className={`${friendsBodyFont.className} mt-3 text-[13px] leading-[1.6] text-[#6b7280] sm:text-sm lg:text-[15px]`}>
                        친구 목록과 요청 상태를 불러오는 중이에요.
                    </p>
                ) : null}

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
                                disabled={searchedFriendActionDisabled}
                                className={`${friendsHeadingFont.className} inline-flex h-11 w-full items-center justify-center rounded-xl border border-[#d7cef9] bg-white px-5 text-[16px] font-bold text-[#5f47d2] shadow-[0px_10px_20px_rgba(108,92,231,0.12)] transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-55 sm:h-12 sm:w-auto sm:min-w-33`}
                            >
                                {searchedFriendActionLabel}
                            </button>
                        </div>
                    </article>
                ) : null}

                {incomingRequests.length > 0 ? (
                    <article className="mt-4 rounded-[18px] border border-[#ddd8ff] bg-[#f8f5ff] px-4 py-4 shadow-[0px_12px_24px_rgba(52,41,104,0.08)] sm:px-5">
                        <p className={`${friendsBodyFont.className} text-[11px] uppercase tracking-[0.18em] text-[#8a7be5]`}>
                            받은 친구 요청
                        </p>
                        <div className="mt-3 grid gap-3">
                            {incomingRequests.map((request) => {
                                const isProcessing = processingRequestId === request.requestId;

                                return (
                                    <article key={request.requestId} className="rounded-2xl border border-[#e4defe] bg-white px-4 py-4">
                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                            <div className="min-w-0">
                                                <p className={`${friendsHeadingFont.className} text-[18px] text-[#111827]`}>
                                                    {request.nickname}
                                                </p>
                                                <p className={`${friendsBodyFont.className} mt-1 text-[12px] text-[#8a7be5]`}>
                                                    {request.requestedAtLabel}
                                                </p>
                                                <p className={`${friendsDisplayFont.className} mt-2 text-[14px] leading-[1.6] text-[#4f5875]`}>
                                                    {request.status}
                                                </p>
                                            </div>

                                            <div className="flex gap-2 sm:w-auto">
                                                <button
                                                    type="button"
                                                    onClick={() => onRejectRequest(request.requestId)}
                                                    disabled={isProcessing}
                                                    className={`${friendsBodyFont.className} min-h-11 flex-1 rounded-xl border border-[#ddd7ff] px-4 py-2 text-[14px] text-[#6b7280] transition-colors hover:bg-[#f8f6ff] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:min-w-24`}
                                                >
                                                    거절
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onAcceptRequest(request.requestId)}
                                                    disabled={isProcessing}
                                                    className={`${friendsHeadingFont.className} min-h-11 flex-1 rounded-xl bg-[#6c5ce7] px-4 py-2 text-[14px] font-bold text-white transition-colors hover:bg-[#5b4ad2] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:min-w-28`}
                                                >
                                                    {isProcessing ? "처리 중..." : "수락"}
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </article>
                ) : null}

                {outgoingRequests.length > 0 ? (
                    <article className="mt-4 rounded-[18px] border border-[#ddd8ff] bg-[#fdfbff] px-4 py-4 shadow-[0px_12px_24px_rgba(52,41,104,0.08)] sm:px-5">
                        <p className={`${friendsBodyFont.className} text-[11px] uppercase tracking-[0.18em] text-[#8a7be5]`}>
                            보낸 친구 요청
                        </p>
                        <div className="mt-3 grid gap-3">
                            {outgoingRequests.map((request) => (
                                <article key={request.requestId} className="rounded-2xl border border-[#ece9ff] bg-white px-4 py-4">
                                    <p className={`${friendsHeadingFont.className} text-[18px] text-[#111827]`}>
                                        {request.nickname}
                                    </p>
                                    <p className={`${friendsBodyFont.className} mt-1 text-[12px] text-[#8a7be5]`}>
                                        {request.requestedAtLabel}
                                    </p>
                                    <p className={`${friendsDisplayFont.className} mt-2 text-[14px] leading-[1.6] text-[#4f5875]`}>
                                        {request.status}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </article>
                ) : null}
            </section>

            <section className="relative overflow-hidden rounded-[22px] bg-[#dcd2ff] px-4 py-4 shadow-[0px_18px_44px_rgba(52,41,104,0.12)] sm:rounded-3xl sm:px-6 sm:py-5 lg:rounded-[26px] lg:px-8 lg:py-6">
                <Image
                    alt="Background pattern"
                    src="/imports/Frame3/background-pattern.svg"
                    width={420}
                    height={220}
                    loading="eager"
                    className="absolute bottom-0 left-0 h-auto w-55 opacity-20 sm:w-75 lg:w-95"
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
                            <article className="rounded-2xl bg-[#faf7ff] px-4 py-4 sm:min-h-28">
                                <p className={`${friendsBodyFont.className} text-[11px] uppercase tracking-[0.18em] text-[#8a7be5]`}>
                                    수락된 친구
                                </p>
                                {isLoadingFriends ? (
                                    <div className="mt-3 h-7 w-12 animate-pulse rounded-full bg-[#e7e1ff]" />
                                ) : (
                                    <p className={`${friendsHeadingFont.className} mt-2 text-[24px] text-[#111827]`}>
                                        {totalFriendCount}
                                    </p>
                                )}
                            </article>
                            <article className="rounded-2xl bg-[#faf7ff] px-4 py-4 sm:min-h-28">
                                <p className={`${friendsBodyFont.className} text-[11px] uppercase tracking-[0.18em] text-[#8a7be5]`}>
                                    받은 요청
                                </p>
                                {isLoadingFriends ? (
                                    <div className="mt-3 h-7 w-12 animate-pulse rounded-full bg-[#e7e1ff]" />
                                ) : (
                                    <p className={`${friendsHeadingFont.className} mt-2 text-[24px] text-[#111827]`}>
                                        {incomingRequests.length}
                                    </p>
                                )}
                            </article>
                            <article className="rounded-2xl bg-[#faf7ff] px-4 py-4 sm:col-span-2 sm:min-h-28 lg:col-span-1">
                                <p className={`${friendsBodyFont.className} text-[11px] uppercase tracking-[0.18em] text-[#8a7be5]`}>
                                    다음 단계
                                </p>
                                <p className={`${friendsDisplayFont.className} mt-2 max-w-[24ch] text-[14px] leading-[1.55] text-[#111827] sm:max-w-none`}>
                                    요청을 수락하면 친구 목록과 chat 진입 대상에 바로 반영
                                </p>
                            </article>
                        </div>
                    </div>

                    <div className="grid gap-3">
                        <article className="rounded-[20px] bg-white/86 px-4 py-4 shadow-[0px_14px_30px_rgba(52,41,104,0.12)] sm:px-5 sm:py-5">
                            <p className={`${friendsBodyFont.className} text-[11px] uppercase tracking-[0.18em] text-[#8a7be5]`}>
                                선택된 친구 미리보기
                            </p>
                            {isLoadingFriends ? (
                                <div className="mt-3 space-y-3">
                                    <div className="h-6 w-32 animate-pulse rounded-full bg-[#e7e1ff]" />
                                    <div className="h-4 w-full max-w-[14rem] animate-pulse rounded-full bg-[#f0ebff]" />
                                    <div className="h-4 w-full max-w-[16rem] animate-pulse rounded-full bg-[#f3efff]" />
                                </div>
                            ) : hasFriends && selectedFriend ? (
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
                                <li>친구 요청을 보낸 뒤에는 상대의 수락 전까지 pending 상태로 유지됩니다.</li>
                                <li>받은 요청을 수락한 사용자만 친구 목록과 chat 화면 진입 대상에 노출됩니다.</li>
                                <li>친구 요청 결과와 오류 문구는 이 화면에서 먼저 확인할 수 있어요.</li>
                            </ul>
                        </article>
                    </div>
                </div>
            </section>
        </div>
    );
}