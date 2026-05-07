import type { FormEvent } from "react";
import Image from "next/image";

import { friendsGradientBackground } from "./data";
import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "./fonts";
import { FriendSearchField } from "./friend-search-field";

type FriendsContentProps = {
    pendingNickname: string;
    onPendingNicknameChange: (nextValue: string) => void;
    onAddFriend: (event: FormEvent<HTMLFormElement>) => void;
    formMessage: string | null;
};

export function FriendsContent({
    pendingNickname,
    onPendingNicknameChange,
    onAddFriend,
    formMessage,
}: FriendsContentProps) {
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

                <form className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:gap-3 lg:mt-8 lg:gap-[10px] xl:mt-10" onSubmit={onAddFriend}>
                    <FriendSearchField
                        value={pendingNickname}
                        onChange={onPendingNicknameChange}
                        placeholder="닉네임을 입력하세요"
                        className="flex-1"
                        inputClassName="sm:h-[50px] lg:h-[52px]"
                    />

                    <button
                        type="submit"
                        className={`${friendsHeadingFont.className} inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-[12px] border-[3px] border-white px-6 text-[18px] font-bold text-white shadow-[0px_10px_24px_rgba(108,92,231,0.18)] transition-opacity hover:opacity-95 sm:h-[50px] sm:text-[19px] md:w-[132px] md:shrink-0 lg:h-[52px] lg:w-[128px] lg:text-[20px]`}
                        style={{ backgroundImage: friendsGradientBackground }}
                    >
                        검색
                    </button>
                </form>

                {formMessage ? (
                    <p className={`${friendsBodyFont.className} mt-3 text-[13px] leading-[1.6] text-[#6c5ce7] sm:text-sm lg:text-[15px]`}>
                        {formMessage}
                    </p>
                ) : null}
            </section>

            <section className="relative overflow-hidden rounded-[22px] bg-[#dcd2ff] px-4 py-4 shadow-[0px_18px_44px_rgba(52,41,104,0.12)] sm:rounded-[24px] sm:px-6 sm:py-5 lg:flex lg:h-full lg:items-center lg:rounded-[26px] lg:px-8 lg:py-6">
                <Image
                    alt="Background pattern"
                    src="/imports/Frame3/background-pattern.svg"
                    width={420}
                    height={220}
                    className="absolute bottom-0 left-0 h-auto w-[220px] opacity-20 sm:w-[300px] lg:w-[380px]"
                />

                <div className="relative z-10 flex w-full flex-col gap-5 md:gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-[430px]">
                        <h2 className={`${friendsHeadingFont.className} text-[24px] font-bold leading-none text-[#111827] sm:text-[28px] lg:text-[32px]`}>
                            지도로 친구 위치 확인하기
                        </h2>
                        <p className={`${friendsDisplayFont.className} mt-3 max-w-[22ch] text-[14px] leading-[1.55] text-[#9aa1b3] sm:mt-4 sm:text-[16px] lg:text-[20px]`}>
                            친구들의 현재 위치를 지도에서 확인하고, 만날 장소를 함께 정해보세요.
                        </p>

                        <button
                            type="button"
                            className={`${friendsHeadingFont.className} mt-5 inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-[12px] border-[3px] border-[#6c5ce7] bg-[#6c5ce7] px-6 text-[18px] font-bold text-white shadow-[0px_10px_24px_rgba(108,92,231,0.18)] transition-opacity hover:opacity-95 sm:mt-6 sm:h-[50px] sm:w-auto sm:px-7 sm:text-[20px] lg:h-14 lg:px-8 lg:text-[22px]`}
                        >
                            지도 보기 &gt;
                        </button>
                    </div>

                    <div className="relative z-10 mx-auto w-full max-w-[250px] sm:max-w-[300px] lg:mr-4 lg:max-w-[360px] xl:mx-0">
                        <Image
                            alt="Map preview illustration"
                            src="/imports/Frame3/a604763b9dcb9625e1ef5385bb425b262fcefddd.png"
                            width={386}
                            height={257}
                            className="h-auto w-full object-contain"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}