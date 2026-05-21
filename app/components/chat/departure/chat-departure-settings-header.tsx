import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../../friends/fonts";

import { ChatActionButton } from "../chat-ui";

type ChatDepartureSettingsHeaderProps = {
    // 상단 안내 문구 본문입니다.
    guideCopy: string;
    // 모바일에서 설정 영역이 접혀 있는지 나타냅니다.
    isMobileSettingsCollapsed: boolean;
    // 모바일 접힘 상태에서 한 줄로 보여줄 요약 문구입니다.
    mobileSettingsSummary: string;
    // 추천 버튼을 눌러도 되는 상태인지 나타냅니다.
    canRecommend: boolean;
    // 모바일 설정 영역 접힘 상태를 토글합니다.
    onToggleMobileSettings: () => void;
    // 현재 조건으로 추천을 실행합니다.
    onRecommend: () => void;
};

export function ChatDepartureSettingsHeader({
    guideCopy,
    isMobileSettingsCollapsed,
    mobileSettingsSummary,
    canRecommend,
    onToggleMobileSettings,
    onRecommend,
}: ChatDepartureSettingsHeaderProps) {
    return (
        <div className="flex flex-col gap-3.5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-md space-y-2.5 sm:space-y-3">
                <h3 className={`${friendsHeadingFont.className} text-[20px] font-bold text-[#111827] sm:text-[24px] lg:text-[28px]`}>
                    추천 조건 정하기
                </h3>
                <p className={`${friendsDisplayFont.className} hidden break-keep text-[12px] leading-[1.6] text-[#6b7280] sm:block sm:text-[14px] lg:text-[16px]`}>
                    {guideCopy}
                </p>
            </div>

            <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-end xl:shrink-0">
                <button
                    type="button"
                    onClick={onToggleMobileSettings}
                    className="flex w-full items-center justify-between gap-3 rounded-[18px] border border-[#e2dcff] bg-[#f7f4ff] px-3.5 py-3 text-left lg:hidden"
                >
                    <div className="min-w-0">
                        <p className={`${friendsHeadingFont.className} text-[15px] text-[#111827]`}>
                            추천 조건
                        </p>
                        <p className={`${friendsBodyFont.className} mt-1 truncate text-[11px] text-[#6b7280]`}>
                            {isMobileSettingsCollapsed ? mobileSettingsSummary : "세부 조건을 펼쳐서 수정 중이에요."}
                        </p>
                    </div>
                    <span className="shrink-0 text-[18px] leading-none text-[#6c5ce7]">
                        {isMobileSettingsCollapsed ? "▾" : "▴"}
                    </span>
                </button>

                <ChatActionButton
                    variant="accent"
                    onClick={onRecommend}
                    disabled={!canRecommend}
                    className={`${friendsHeadingFont.className} min-h-12 w-full rounded-2xl px-5 py-2.5 text-[16px] font-bold leading-none disabled:cursor-not-allowed disabled:opacity-55 md:min-h-14 md:w-auto md:px-7 md:py-3.5 md:text-[18px] xl:shrink-0`}
                >
                    추천 받기
                </ChatActionButton>
            </div>
        </div>
    );
}