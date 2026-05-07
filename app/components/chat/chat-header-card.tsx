import { getFriendInitial } from "../friends/data";
import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../friends/fonts";
import type { FriendItem } from "../friends/types";

type ChatHeaderCardProps = {
    selectedFriend: FriendItem;
    lastSharedAt: string | null;
};

export function ChatHeaderCard({ selectedFriend, lastSharedAt }: ChatHeaderCardProps) {
    return (
        <section className="rounded-[22px] bg-white px-4 py-4 shadow-[0px_18px_44px_rgba(52,41,104,0.14)] sm:rounded-[24px] sm:px-6 sm:py-5 lg:rounded-[26px] lg:px-8 lg:py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-[#d9d9d9] text-[18px] text-[#111827] sm:h-[56px] sm:w-[56px] sm:text-[22px] lg:h-[58px] lg:w-[58px] lg:text-[24px]">
                        <span className={`${friendsDisplayFont.className} leading-none`}>
                            {getFriendInitial(selectedFriend.nickname)}
                        </span>
                    </div>

                    <div className="min-w-0 space-y-1.5">
                        <h2 className={`${friendsHeadingFont.className} break-keep text-[20px] font-bold leading-[1.15] text-[#111827] sm:text-[24px] lg:text-[30px]`}>
                            {selectedFriend.nickname} 님과의 채팅
                        </h2>
                        <p className={`${friendsDisplayFont.className} break-keep text-[13px] leading-[1.55] text-[#6b7280] sm:text-[15px] lg:text-[17px]`}>
                            마지막 위치 공유: {lastSharedAt ?? "아직 공유 전"}
                        </p>
                        <p className={`${friendsBodyFont.className} break-keep text-[12px] leading-[1.5] text-[#6c5ce7] sm:text-[13px] lg:text-[14px]`}>
                            현재 추천 기준 대상 친구로 선택되어 있어요.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className={`${friendsDisplayFont.className} inline-flex min-h-[46px] w-full cursor-pointer items-center justify-center rounded-[12px] border-2 border-[#6c5ce7] bg-white px-4 py-2.5 text-[15px] text-[#6c5ce7] transition-[background-color,transform,box-shadow] duration-200 hover:bg-[#f7f4ff] hover:shadow-[0px_10px_24px_rgba(108,92,231,0.08)] sm:min-h-[48px] sm:w-auto sm:px-6 sm:py-3 sm:text-[17px] lg:text-[18px]`}
                >
                    지도에서 위치 확인
                </button>
            </div>
        </section>
    );
}